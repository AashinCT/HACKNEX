# Proof-Carrying Data Analyst 

An Agentic GenAI system built for rigorous, mathematically bulletproof data analysis. 

## What is this?
A standard LLM behaves like a search engine or an assistant: you ask a question, and it guesses the text response. 
**But a Proof-Carrying Data Analyst flips that model upside down.** It doesn't just give an answer—it hands over the **receipt** and the **calculator**.

In this system, the output is a two-part package:
1. **The Answer:** The final computed number or analytical conclusion.
2. **The Proof:** The exact, executable Python script that any independent auditor (or automated test runner) can run to verify that the math is mathematically bulletproof.

This solves the biggest flaw of modern AI—**hallucinations and unverified confidence.**

## Real World Execution
**Automated Tax Compliance & Corporate Auditing (Fintech)**

*   **The Real-World Mess:** Multinational corporations deal with thousands of invoices, receipts, and bank statements across different currencies, varying tax codes, and duplicate billing attempts by suppliers.
*   more detailed**How Your System Works:** An auditor asks, *"What was our exact net deductible expense in Europe for Q3 after currency conversion and removing duplicate vendor entries?"*
*   **The Real-Life Impact:** Instead of an LLM blindly summarizing numbers (and risking millions in compliance fines if it hallucinates), our agent writes a Pandas script that cleans the messy logs, catches duplicate IDs, handles exchange rates, and outputs the final sum **along with the exact Python script**.
*   The human auditor can run that script to instantly verify the compliance trail before submitting to tax authorities.

## What will our model exactly do?
If someone asks it a tricky question about a messy spreadsheet or database, it does two things:
1.  **Does the math using code** (instead of guessing in its head like standard LLMs).
2.  **Hands over the exact Python script** it used to get that answer, so anyone can run it and double-check its work.

If the data is too messed up or contradictory, it doesn't try to fake an answer—it simply says: *"I can't trust this data, here is why."*

> Basically, it's not an LLM anymore that guesses the thing or just gives interpreted answers. It gives proof of how things actually happened.

## Detailed Explanation
*   **A normal LLM** is like a student who tries to solve a complex math exam entirely from memory—sometimes they get it right, but sometimes they hallucinate and sound totally confident even when they're wrong.
*   **Our system** is like a brilliant programmer-student who uses a Python calculator to do all the heavy lifting, runs the code to check the result, and then hands the teacher both the final answer *and* the working code notebook so the teacher can verify every single step.

The LLM’s only job in our system is to **read the question, write the code, and explain the output**. The actual thinking and calculating happen through code execution. That combo is what makes it a true **Agentic GenAI** system!

## Why not just use ChatGPT?
*ChatGPT can write Python code too, so why build this?*

### 1. The Hackathon Evaluation Constraint (The Automated Verifier)
In this competition, judges or an automated test runner script will send dozens of complex, trap-laden queries to our system's API backend automatically.
*   ChatGPT can't automatically plug into an automated evaluation harness unless wrapped in custom code.
*   Our system features an **end-to-end programmatic loop**: `receive query` → `parse data schema` → `generate script` → `execute in a secure sandbox` → `evaluate if the code passes` → `output structured proof-carrying JSON or UI components`.

### 2. Handling the "Refusal Trap" Reliably
When standard LLMs encounter a tricky or contradictory dataset, their default instinct is to be helpful. Even if data contradicts itself, they will usually try to estimate, smooth over the error, and give a confident answer anyway.
*   Our agent has hardcoded or tightly system-prompted guardrails that force it to say: *"Data is contradictory; refusing to compute."*
*   We program the logic that detects when a query is a trap, rather than relying on an off-the-shelf chatbot's polite conversational habits.

### 3. What We Are Actually Building
We aren't training a brand-new LLM from scratch. We are building the **application wrapper and verification pipeline** around an LLM (using its API) that turns it into a rigorous, closed-loop analytical tool.

**In summary:**
> "ChatGPT is a general-purpose chat interface. Our system is a **deterministic verification pipeline**. It uses an LLM as a compiler/planner, but enforces strict sandbox execution, automated error-correction loops, and structured proof receipts so that every single output is mathematically bound to re-runnable code that an automated auditor can execute instantly."
