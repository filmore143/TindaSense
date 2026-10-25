const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "products", component: () => import("pages/ProductsPage.vue") },
      { path: "record", component: () => import("pages/RecordPage.vue") },
      { path: "utang", component: () => import("pages/UtangPage.vue") },
      { path: "insights", component: () => import("pages/InsightsPage.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
