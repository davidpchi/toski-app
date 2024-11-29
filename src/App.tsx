import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./navigation/routes";
import { Provider } from "react-redux";
import { createStore } from "@reduxjs/toolkit";
import { rootReducer } from "./redux/rootReducer";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const store = createStore(rootReducer);

export default function App() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <ReactQueryDevtools buttonPosition={"bottom-left"} />
            </QueryClientProvider>
        </Provider>
    );
}
