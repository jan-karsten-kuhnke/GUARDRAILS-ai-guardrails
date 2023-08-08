class AppletResponse:
    def __init__(self, answer: str, sources: list, visualization: str = None, dataset: str = None ):
        self.answer = answer
        self.sources = sources
        self.visualization = visualization
        self.dataset = dataset

    def obj(self):
        data = {"answer": self.answer, "sources": self.sources, "visualization": self.visualization, "dataset": self.dataset}
        return data