import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as accountsRoute } from "./routes/accounts";
import { Route as growthRoute } from "./routes/growth";
import { Route as indexRoute } from "./routes/index";
import { Route as settingsRoute } from "./routes/settings";
import { Route as summaryRoute } from "./routes/summary";

const routeTree = rootRoute.addChildren([
  indexRoute,
  summaryRoute,
  accountsRoute,
  growthRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
