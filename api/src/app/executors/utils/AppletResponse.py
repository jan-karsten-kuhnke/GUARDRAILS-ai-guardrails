class AppletResponse:
    def __init__(self, answer: str, sources: list ):
        self.answer = answer
        self.sources = sources

    def obj(self):
        data = {"answer": self.answer, "sources": self.sources}
        return data