import { RouterProvider } from "react-router";

import { RootErrorBoundary } from "./RootErrorBoundary";
import { router } from "./router";

export default function App() {
  return (
    <RootErrorBoundary>
      <RouterProvider router={router} />
    </RootErrorBoundary>
  );
}
