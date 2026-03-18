from ollama import Client

class JobAdSummariser:
    def __init__ (self, model_name: str = "qwen3.5:397b-cloud", options: dict = { "temperature": 0.3, "repeat_penalty":1.3, "seed":42}):
        
        self.client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + '3c6f824ed886478283aeba63f304f263.N-AYUv78Xzy3-EqfBK4PJ2tO'})
        
        self.__model_name = model_name
        self.__options = options

        self.__system_prompt = {
            'role': 'system',
            'content': """Summarise the following job advertisement into a concise, factual paragraph.

RULES:
- Do NOT add, assume, or infer any information
- Use only details explicitly stated
- Keep wording close to original
- Remove all fluff, repetition, and marketing language
- Use clear, direct sentences (no vague phrases like "you will have the opportunity")

OUTPUT:
Write 3–4 sentences covering:
1. Company + role + location
2. Main responsibilities (action-focused)
3. Key tech stack / skills
4. Experience level or expectations

STYLE:
- Professional and neutral tone
- Prefer strong verbs (build, migrate, develop, improve)
- Keep it tight and information-dense

Return ONLY the paragraph."""
        }

    def summarise(self, job_ad_text: str) -> str:
        response = self.client.chat(
            model=self.__model_name,
            messages=[
                self.__system_prompt,
                {
                    'role': 'user',
                    'content': job_ad_text
                }
            ],
            stream=False,
            options=self.__options
        )

        return response["message"]["content"].strip()