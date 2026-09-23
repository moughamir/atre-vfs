"use client";

import { create } from "zustand";
import type {
  ScreenId,
  TabId,
  Product,
  ModelOption,
  ModelPreference,
  SceneOption,
  StyleOption,
  GeneratedImage,
  ProjectStatus,
  Listing,
  ProjectSummary,
  FavoriteImage,
} from "@/lib/types";

interface ToastMsg {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

interface AppState {
  // Navigation
  activeTab: TabId;
  screen: ScreenId;
  screenStack: ScreenId[];
  previousScreen: ScreenId | null;

  // Selected entities
  selectedProductId: string | null;
  selectedImageIndex: number | null;
  selectedListingId: string | null;
  selectedProjectId: string | null;

  // Studio flow
  studio: {
    id: string | null;
    product: Product | null;
    model: ModelOption;
    modelPreference: ModelPreference | null;
    scene: SceneOption;
    style: StyleOption;
    status: ProjectStatus;
    currentImages: GeneratedImage[];
    allGenerations: GeneratedImage[][];
    activeGeneration: number;
    editTarget: "model" | "scene" | "style" | null;
  };

  // Shop
  listings: Listing[];

  // Projects (persisted)
  projects: ProjectSummary[];
  projectsLoaded: boolean;

  // Favorites (persisted)
  favorites: FavoriteImage[];
  favoritesLoaded: boolean;

  // Toasts (lightweight, separate from sonner for screen-driven messaging)
  toasts: ToastMsg[];

  // Actions
  setActiveTab: (tab: TabId) => void;
  navigate: (screen: ScreenId) => void;
  goBack: () => void;

  selectProduct: (product: Product) => void;
  setSelectedImageIndex: (i: number | null) => void;
  openListing: (id: string) => void;
  openProject: (id: string) => void;

  // Studio actions
  startStudio: (product: Product) => void;
  setStudioProjectId: (id: string | null) => void;
  setStudioModel: (m: ModelOption) => void;
  setStudioModelPreference: (p: ModelPreference | null) => void;
  setStudioScene: (s: SceneOption) => void;
  setStudioStyle: (s: StyleOption) => void;
  setStudioStatus: (s: ProjectStatus) => void;
  setStudioImages: (imgs: GeneratedImage[]) => void;
  addGeneration: (imgs: GeneratedImage[]) => void;
  setActiveGeneration: (index: number) => void;
  toggleImageSelected: (id: string) => void;
  toggleImageFavorite: (id: string) => void;
  resetStudio: () => void;
  startEditImage: (target: "model" | "scene" | "style") => void;
  clearEditTarget: () => void;

  // Listings
  setListings: (l: Listing[]) => void;
  addListing: (l: Listing) => void;

  // Projects
  setProjects: (p: ProjectSummary[]) => void;
  upsertProject: (p: ProjectSummary) => void;
  removeProject: (id: string) => void;

  // Favorites
  setFavorites: (f: FavoriteImage[]) => void;
  addFavorite: (f: FavoriteImage) => void;
  removeFavorite: (url: string) => void;

  // Toasts
  pushToast: (t: Omit<ToastMsg, "id">) => void;
  dismissToast: (id: string) => void;
}

const initialStudio = {
  id: null as string | null,
  product: null as Product | null,
  model: "woman" as ModelOption,
  modelPreference: null as ModelPreference | null,
  scene: "studio" as SceneOption,
  style: "clean" as StyleOption,
  status: "configuring" as ProjectStatus,
  currentImages: [] as GeneratedImage[],
  allGenerations: [] as GeneratedImage[][],
  activeGeneration: 0 as number,
  editTarget: null as "model" | "scene" | "style" | null,
};

export const useApp = create<AppState>((set, get) => ({
  activeTab: "home",
  screen: "home",
  screenStack: ["home"],
  previousScreen: null,

  selectedProductId: null,
  selectedImageIndex: null,
  selectedListingId: null,
  selectedProjectId: null,

  studio: initialStudio,
  listings: [],
  projects: [],
  projectsLoaded: false,
  favorites: [],
  favoritesLoaded: false,
  toasts: [],

  setActiveTab: (tab) => {
    const homeScreens: Record<TabId, ScreenId> = {
      home: "home",
      products: "products",
      studio: "studio-product",
      shop: "shop",
      more: "more",
    };
    set({
      activeTab: tab,
      screen: homeScreens[tab],
      screenStack: [homeScreens[tab]],
      previousScreen: null,
    });
  },

  navigate: (screen) => {
    set((s) => ({
      screen,
      screenStack: [...s.screenStack, screen],
      previousScreen: s.screen,
    }));
    // sync tab when navigating to a tab-root screen
    if (screen === "home") set({ activeTab: "home" });
    else if (screen === "products") set({ activeTab: "products" });
    else if (screen === "shop") set({ activeTab: "shop" });
    else if (screen === "more") set({ activeTab: "more" });
  },

  goBack: () => {
    const stack = get().screenStack;
    if (stack.length > 1) {
      const newStack = stack.slice(0, -1);
      const prev = newStack[newStack.length - 1];
      const tabMap: Partial<Record<ScreenId, TabId>> = {
        home: "home",
        products: "products",
        "product-detail": "products",
        "add-product": "products",
        "edit-product": "products",
        shop: "shop",
        "shop-detail": "shop",
        more: "more",
        favorites: "home",
        projects: "home",
        "project-detail": "home",
        "studio-product": "studio",
        "studio-model": "studio",
        "studio-scene": "studio",
        "studio-style": "studio",
        "studio-summary": "studio",
        generating: "studio",
        results: "studio",
        "image-detail": "studio",
        "edit-image": "studio",
        publish: "studio",
        success: "studio",
      };
      set({
        screen: prev,
        screenStack: newStack,
        previousScreen: newStack.length > 1 ? newStack[newStack.length - 2] : null,
        activeTab: tabMap[prev] ?? get().activeTab,
      });
    }
  },

  selectProduct: (product) => {
    set({ selectedProductId: product.id });
  },

  setSelectedImageIndex: (i) => set({ selectedImageIndex: i }),

  openListing: (id) => {
    set({ selectedListingId: id });
    get().navigate("shop-detail");
  },

  openProject: (id) => {
    set({ selectedProjectId: id });
    get().navigate("project-detail");
  },

  // Studio
  startStudio: (product) => {
    set({
      studio: {
        ...initialStudio,
        product,
        status: "configuring",
      },
      screen: "studio-product",
      screenStack: ["studio-product"],
      activeTab: "studio",
    });
  },

  setStudioProjectId: (id) =>
    set((s) => ({ studio: { ...s.studio, id } })),

  setStudioModel: (m) => set((s) => ({ studio: { ...s.studio, model: m } })),
  setStudioModelPreference: (p) =>
    set((s) => ({ studio: { ...s.studio, modelPreference: p } })),
  setStudioScene: (sc) => set((s) => ({ studio: { ...s.studio, scene: sc } })),
  setStudioStyle: (st) => set((s) => ({ studio: { ...s.studio, style: st } })),
  setStudioStatus: (st) => set((s) => ({ studio: { ...s.studio, status: st } })),
  setStudioImages: (imgs) =>
    set((s) => ({ studio: { ...s.studio, currentImages: imgs } })),

  addGeneration: (imgs) =>
    set((s) => ({
      studio: {
        ...s.studio,
        currentImages: imgs,
        allGenerations: [imgs, ...s.studio.allGenerations],
        activeGeneration: 0,
      },
    })),

  setActiveGeneration: (index) =>
    set((s) => {
      const gen = s.studio.allGenerations[index];
      if (!gen) return s;
      return {
        studio: {
          ...s.studio,
          currentImages: gen,
          activeGeneration: index,
        },
      };
    }),

  toggleImageSelected: (id) =>
    set((s) => ({
      studio: {
        ...s.studio,
        currentImages: s.studio.currentImages.map((img) =>
          img.id === id ? { ...img, selected: !img.selected } : img,
        ),
      },
    })),

  toggleImageFavorite: (id) =>
    set((s) => ({
      studio: {
        ...s.studio,
        currentImages: s.studio.currentImages.map((img) =>
          img.id === id ? { ...img, favorite: !img.favorite } : img,
        ),
      },
    })),

  resetStudio: () => set({ studio: initialStudio }),

  startEditImage: (target) =>
    set((s) => ({ studio: { ...s.studio, editTarget: target } })),
  clearEditTarget: () =>
    set((s) => ({ studio: { ...s.studio, editTarget: null } })),

  setListings: (l) => set({ listings: l }),
  addListing: (l) => set((s) => ({ listings: [l, ...s.listings] })),

  // Projects
  setProjects: (p) => set({ projects: p, projectsLoaded: true }),
  upsertProject: (p) =>
    set((s) => ({
      projects: [p, ...s.projects.filter((x) => x.id !== p.id)],
    })),
  removeProject: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  // Favorites
  setFavorites: (f) => set({ favorites: f, favoritesLoaded: true }),
  addFavorite: (f) =>
    set((s) =>
      s.favorites.some((x) => x.url === f.url)
        ? s
        : { favorites: [f, ...s.favorites] },
    ),
  removeFavorite: (url) =>
    set((s) => ({ favorites: s.favorites.filter((f) => f.url !== url) })),

  pushToast: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 3200);
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
