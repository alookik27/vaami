
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home.jsx";
import CallPage from "./pages/CallPage.jsx";
import CallDetails from "./pages/CallDetails.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";




function App() {
  return (
    <>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/calls/:id" element={<CallDetails />} />
      </Routes>
      <Footer/>
    </>
  );
}

export default App;