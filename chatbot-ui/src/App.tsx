import "./App.module.scss";
import { Home } from "pages/home/home";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="flex h-full w-full pt-[48px] sm:pt-0">
      <Toaster />
      <Home />
    </div>
  );
}

export default App;
