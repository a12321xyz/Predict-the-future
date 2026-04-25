# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

# EVM interface for sending GEN to an EOA
@gl.evm.contract_interface
class _Recipient:
    class View:
        pass
    class Write:
        def send(self) -> None: ...

class PredictionMarket(gl.Contract):
    # ── Storage ──────────────────────────────────────────────────────
    next_market_id: bigint
    markets: TreeMap[bigint, str]               # market_id -> JSON blob (market data)
    bets_yes: TreeMap[bigint, TreeMap[str, u256]] # market_id -> user_address -> amount
    bets_no: TreeMap[bigint, TreeMap[str, u256]]  # market_id -> user_address -> amount
    pool_yes: TreeMap[bigint, u256]             # market_id -> total YES pool
    pool_no: TreeMap[bigint, u256]              # market_id -> total NO pool
    claimed: TreeMap[bigint, TreeMap[str, bool]] # market_id -> user_address -> bool

    def __init__(self):
        self.next_market_id = 1

    # ── Helpers ──────────────────────────────────────────────────────
    def _load_market(self, market_id: bigint) -> dict:
        raw = self.markets.get(market_id, "")
        if not raw:
            raise gl.vm.UserError("Market not found")
        return json.loads(raw)

    def _save_market(self, market_id: bigint, data: dict) -> None:
        self.markets[market_id] = json.dumps(data, sort_keys=True)

    # ── Write Methods ────────────────────────────────────────────────

    @gl.public.write
    def create_market(
        self,
        question: str,
        description: str,
        resolution_url: str,
        resolve_after_timestamp: int
    ) -> None:
        market_id = self.next_market_id
        data = {
            "id": str(market_id),
            "creator": str(gl.message.sender_address),
            "question": question,
            "description": description,
            "resolution_url": resolution_url,
            "resolve_after_timestamp": str(resolve_after_timestamp),
            "status": "open", # open, resolved
            "outcome": "none", # yes, no, invalid
            "ai_reasoning": "",
        }
        self._save_market(market_id, data)
        self.next_market_id = market_id + 1

    @gl.public.write.payable
    def bet(self, market_id: int, is_yes: bool) -> None:
        mid_bi = bigint(market_id)
        market = self._load_market(mid_bi)
        
        if market["status"] != "open":
            raise gl.vm.UserError("Market is closed")
            
        # TODO: enforce timestamp
        # if current_timestamp >= int(market["resolve_after_timestamp"]): ...
        
        sender = str(gl.message.sender_address)
        amount = gl.message.value
        if amount == u256(0):
            raise gl.vm.UserError("Bet amount must be greater than 0")

        if is_yes:
            if mid_bi not in self.bets_yes:
                self.bets_yes[mid_bi] = TreeMap()
            if sender not in self.bets_yes[mid_bi]:
                self.bets_yes[mid_bi][sender] = u256(0)
            self.bets_yes[mid_bi][sender] += amount
            
            current_pool = self.pool_yes.get(mid_bi, u256(0))
            self.pool_yes[mid_bi] = current_pool + amount
        else:
            if mid_bi not in self.bets_no:
                self.bets_no[mid_bi] = TreeMap()
            if sender not in self.bets_no[mid_bi]:
                self.bets_no[mid_bi][sender] = u256(0)
            self.bets_no[mid_bi][sender] += amount
            
            current_pool = self.pool_no.get(mid_bi, u256(0))
            self.pool_no[mid_bi] = current_pool + amount

    @gl.public.write
    def resolve_market(self, market_id: int) -> None:
        mid_bi = bigint(market_id)
        market = self._load_market(mid_bi)
        
        if market["status"] != "open":
            raise gl.vm.UserError("Market is already resolved")

        # In a real scenario we might check the block timestamp here to ensure resolution
        # time is reached, but skipping for simplicity or hackathon.

        question = str(market["question"])
        description = str(market["description"])
        resolution_url = str(market["resolution_url"])

        def leader_fn():
            evidence = ""
            if resolution_url:
                try:
                    resp = gl.nondet.web.get(resolution_url)
                    evidence = resp[:4000] if isinstance(resp, str) else str(resp)[:4000]
                except Exception:
                    evidence = f"Could not fetch data from {resolution_url}"

            prompt = f"""You are an unbiased AI oracle resolving a prediction market.

MARKET QUESTION: {question}
MARKET DESCRIPTION: {description}
RESOLUTION SOURCE URL: {resolution_url}

EVIDENCE FETCHED (first 4000 characters):
{evidence}

Task: Determine if the event happened based on the evidence.
Answer "yes" if the event happened or condition is true. 
Answer "no" if the event did not happen or condition is false.
Answer "invalid" if it's too ambiguous, impossible to determine, or evidence is missing.

Respond ONLY with a JSON object:
{{"outcome": "yes" or "no" or "invalid", "reasoning": "brief explanation based on evidence"}}"""

            result = gl.nondet.exec_prompt(prompt, response_format="json")
            if not isinstance(result, dict):
                raise gl.vm.UserError("LLM returned invalid format")
            return result

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            leader_data = leaders_res.calldata
            if not isinstance(leader_data, dict):
                return False
            if "outcome" not in leader_data:
                return False
            if leader_data["outcome"] not in ("yes", "no", "invalid"):
                return False
            
            try:
                my_result = leader_fn()
                return my_result.get("outcome") == leader_data.get("outcome")
            except Exception:
                return False

        eval_result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        
        outcome = eval_result.get("outcome", "invalid")
        reasoning = eval_result.get("reasoning", "")
        
        market["status"] = "resolved"
        market["outcome"] = outcome
        market["ai_reasoning"] = reasoning
        self._save_market(mid_bi, market)

    @gl.public.write
    def claim_winnings(self, market_id: int) -> None:
        mid_bi = bigint(market_id)
        market = self._load_market(mid_bi)
        
        if market["status"] != "resolved":
            raise gl.vm.UserError("Market is not resolved yet")
            
        outcome = market["outcome"]
        sender = str(gl.message.sender_address)
        
        # Check if already claimed
        if mid_bi not in self.claimed:
            self.claimed[mid_bi] = TreeMap()
        if self.claimed[mid_bi].get(sender, False):
            raise gl.vm.UserError("Winnings already claimed")
            
        pool_yes = self.pool_yes.get(mid_bi, u256(0))
        pool_no = self.pool_no.get(mid_bi, u256(0))
        
        # Calculate payout
        payout = u256(0)
        
        if outcome == "yes":
            bet_yes = u256(0)
            if mid_bi in self.bets_yes and sender in self.bets_yes[mid_bi]:
                bet_yes = self.bets_yes[mid_bi][sender]
                
            if bet_yes > u256(0) and pool_yes > u256(0):
                # user share = (bet / pool_yes) * (pool_yes + pool_no)
                # handle division in GenLayer (math operations on u256)
                total_pool = pool_yes + pool_no
                payout = (bet_yes * total_pool) // pool_yes
                
        elif outcome == "no":
            bet_no = u256(0)
            if mid_bi in self.bets_no and sender in self.bets_no[mid_bi]:
                bet_no = self.bets_no[mid_bi][sender]
                
            if bet_no > u256(0) and pool_no > u256(0):
                total_pool = pool_yes + pool_no
                payout = (bet_no * total_pool) // pool_no
                
        elif outcome == "invalid":
            # Refund
            bet_yes = u256(0)
            bet_no = u256(0)
            if mid_bi in self.bets_yes and sender in self.bets_yes[mid_bi]:
                bet_yes = self.bets_yes[mid_bi][sender]
            if mid_bi in self.bets_no and sender in self.bets_no[mid_bi]:
                bet_no = self.bets_no[mid_bi][sender]
            payout = bet_yes + bet_no
            
        if payout == u256(0):
            raise gl.vm.UserError("No winnings to claim")
            
        self.claimed[mid_bi][sender] = True
        _Recipient(Address(sender)).send(value=payout)

    # ── View Methods ─────────────────────────────────────────────────
    @gl.public.view
    def get_market(self, market_id: int) -> str:
        mid_bi = bigint(market_id)
        raw = self.markets.get(mid_bi, "")
        if not raw:
            return json.dumps(None)
            
        data = json.loads(raw)
        data["pool_yes"] = str(self.pool_yes.get(mid_bi, u256(0)))
        data["pool_no"] = str(self.pool_no.get(mid_bi, u256(0)))
        return json.dumps(data)
        
    @gl.public.view
    def list_markets(self) -> str:
        result = []
        for mid_bi in self.markets:
            raw = self.markets[mid_bi]
            if raw:
                doc = json.loads(raw)
                doc["pool_yes"] = str(self.pool_yes.get(mid_bi, u256(0)))
                doc["pool_no"] = str(self.pool_no.get(mid_bi, u256(0)))
                result.append(doc)
        return json.dumps(result)
        
    @gl.public.view
    def get_bet(self, market_id: int, user_address: str) -> str:
        mid_bi = bigint(market_id)
        
        bet_yes = u256(0)
        bet_no = u256(0)
        
        if mid_bi in self.bets_yes and user_address in self.bets_yes[mid_bi]:
            bet_yes = self.bets_yes[mid_bi][user_address]
        if mid_bi in self.bets_no and user_address in self.bets_no[mid_bi]:
            bet_no = self.bets_no[mid_bi][user_address]
            
        claimed = False
        if mid_bi in self.claimed and user_address in self.claimed[mid_bi]:
            claimed = self.claimed[mid_bi][user_address]
            
        return json.dumps({
            "bet_yes": str(bet_yes),
            "bet_no": str(bet_no),
            "claimed": claimed
        })
