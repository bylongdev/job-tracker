from ollama import Client

class JobAdSkillGenerator:
    def __init__ (self, model_name: str = "qwen3.5:397b-cloud", options: dict = { "temperature": 0.1, "repeat_penalty":1.2, "seed":42}):
        
        self.client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + '3c6f824ed886478283aeba63f304f263.N-AYUv78Xzy3-EqfBK4PJ2tO'})
        
        self.__model_name = model_name
        self.__options = options

        self.__system_prompt = {
            'role': 'system',
            'content': """You are a job skill summarisation engine.

Your task: derive EXACTLY top 6 high-level skills from a job advertisement.

RULES:
- Use ONLY information from responsibilities, requirements, and tech stack.
- Skills must be high-level capability areas (not tools or tasks).
- Group closely related items into one coherent skill.
- Keep a consistent abstraction level.
- Avoid overlap between skills.

NAMING:
- 2–5 words per skill
- Noun-based, simple and practical (e.g. "Frontend Development", "Testing")
- Avoid vague traits or low-level actions

DETAILS:
- Format: "Skill Name (tech/examples)"
- Include only explicitly mentioned tools/technologies
- Keep details concise
- Omit parentheses if not needed

FALLBACK:
- If fewer than 6 clear skills, derive carefully from strong signals
- Do NOT invent new domains

FORMAT:
- Return EXACTLY 6 skills.
- Each skill must follow this format:

"<Skill name> (<optional details>)"

- The skill name should be clean and simple.
- The details in parentheses should include key technologies or concrete examples explicitly mentioned in the job ad.
- Keep details concise and relevant.
- Do NOT hallucinate tools or technologies.
- Omit parentheses if no meaningful details are available.

Output:
- Return a JSON array of 6 strings only.
- No explanation. No extra text."""
        }

    def generate_skills(self, extracted_data: dict) -> list[str]:
        messages = [
            self.__system_prompt,
            {
                'role': 'user',
                'content': extracted_data
            }
        ]

        response = self.client.chat(messages=messages, model=self.__model_name, format="json", stream=False, options=self.__options)
        return response['message']['content']