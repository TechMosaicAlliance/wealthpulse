import { Layout } from "@/components/layout/Layout";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { Outlet, createRootRoute } from "@tanstack/react-router";

function RootComponent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
