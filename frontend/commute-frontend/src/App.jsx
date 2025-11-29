import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import MapComponent from "@/components/map/MapComponent";

const isDev =
  !import.meta.env.VITE_REACT_APP_ENVIRONMENT ||
  import.meta.env.VITE_REACT_APP_ENVIRONMENT === "development";

const queryClient = new QueryClient();
const toastOptions = { duration: 4000, position: "top-center" };

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MapComponent />} />
        </Routes>
        {/* {isDev && <ReactQueryDevtools initialIsOpen={false} />} */}
        <Toaster toastOptions={toastOptions} />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;