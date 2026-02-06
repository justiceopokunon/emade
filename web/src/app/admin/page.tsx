"use client";

import {
  adminPanels,
  diyProjects,
  stories,
  stats,
  teamMembers,
  contactChannels,
  ewasteImages as defaultEwasteImages,
  storyImages as defaultStoryImages,
  navItems as defaultNavItems,
  galleryContent as defaultGalleryContent,
  galleryTiles as defaultGalleryTiles,
} from "@/lib/data";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AdminPreviewModal from "@/components/AdminPreviewModal";
import ImageCropModal from "@/components/ImageCropModal";
import { resizeImage, resizeToTileDimensions } from "@/lib/imageResize";

const expectedPasswords = (
  process.env.NEXT_PUBLIC_ADMIN_PASS || "slingshot-admin"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type GalleryContent = typeof defaultGalleryContent;
type GalleryTile = typeof defaultGalleryTiles[number];
type GalleryTileSize = GalleryTile["size"];

const galleryTileSizeOptions: { label: string; value: GalleryTileSize; detail: string }[] = [
  { label: "Square", value: "square", detail: "1x1 tile" },
  { label: "Landscape", value: "landscape", detail: "Wide 2x1 tile" },
  { label: "Portrait", value: "portrait", detail: "Tall 1x2 tile" },
  { label: "Spotlight", value: "spotlight", detail: "Hero 2x2 tile" },
];

const adminNavSections = [
  { id: "overview", label: "Control overview" },
  { id: "gallery", label: "Gallery tools" },
  { id: "hero", label: "Hero promise" },
  { id: "stats", label: "Impact stats" },
  { id: "slideshows", label: "Slideshows" },
  { id: "diy", label: "DIY blueprints" },
  { id: "moderation", label: "Forum moderation" },
  { id: "stories", label: "Stories" },
  { id: "team", label: "Team" },
  { id: "contact", label: "Contact" },
  { id: "site-navigation", label: "Navigation" },
  { id: "submit-cta", label: "Submit CTA" },
];

const mergeGalleryContent = (
  incoming?: Partial<GalleryContent>
): GalleryContent => {
  const hero = {
    ...defaultGalleryContent.hero,
    ...(incoming?.hero ?? {}),
  };
  const baseSections = defaultGalleryContent.sections;
  const hydratedSections = baseSections.map((section) => {
    const override = incoming?.sections?.find((item) => item.id === section.id);
    return { ...section, ...(override ?? {}) };
  });
  const extraSections = (incoming?.sections ?? []).filter(
    (incomingSection) => !hydratedSections.some((section) => section.id === incomingSection.id)
  );
  return {
    hero,
    sections: [...hydratedSections, ...extraSections],
  };
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  // null = unknown, false = not authed, true = authed
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);
  const [heroMessage, setHeroMessage] = useState(
    "We turn e-waste into resilient public infrastructure."
  );
  const [published, setPublished] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState(diyProjects[0].name);
  const [selectedStory, setSelectedStory] = useState(stories[0]?.title ?? "");
  const [statDrafts, setStatDrafts] = useState(stats);
  const [storyDrafts, setStoryDrafts] = useState(stories);
  const [diyDrafts, setDiyDrafts] = useState(diyProjects);
  const [teamDrafts, setTeamDrafts] = useState(teamMembers);
  const [contactsDraft, setContactsDraft] = useState(contactChannels);
  const [ewasteSlides, setEwasteSlides] = useState(defaultEwasteImages);
  const [storySlides, setStorySlides] = useState(defaultStoryImages);
  const [navDrafts, setNavDrafts] = useState(defaultNavItems);
  const [galleryDraft, setGalleryDraft] = useState(defaultGalleryContent);
  const [galleryTilesDraft, setGalleryTilesDraft] = useState(defaultGalleryTiles);
  const [activeSection, setActiveSection] = useState(adminNavSections[0].id);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [submitCtaDraft, setSubmitCtaDraft] = useState({
    title: "Share your story or idea",
    description: "Have a safety tip, community ad, workshop idea, or e-waste story to share? We'd love to feature it on the site.",
    email: "submit@emade.org",
    buttonText: "Send us your idea",
  });
  const [submitCtaStatus, setSubmitCtaStatus] = useState("");
  const [heroStatus, setHeroStatus] = useState("");
  const [statsStatus, setStatsStatus] = useState("");
  const [teamStatus, setTeamStatus] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [moderationStatus, setModerationStatus] = useState("");
  const [storyStatus, setStoryStatus] = useState("");
  const [diyStatus, setDiyStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [navStatus, setNavStatus] = useState("");
  const [galleryStatus, setGalleryStatus] = useState("");
  const [galleryTilesStatus, setGalleryTilesStatus] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSection, setPreviewSection] = useState("");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageFile, setCropImageFile] = useState<File | null>(null);
  const [cropTileId, setCropTileId] = useState<string>("");
  const [cropTileSize, setCropTileSize] = useState<GalleryTileSize>("square");
  const [cropTarget, setCropTarget] = useState<"gallery" | "story" | "ewaste" | "storyslide">("gallery");
  const [cropStoryIndex, setCropStoryIndex] = useState<number | null>(null);
  const [cropSlideIndex, setCropSlideIndex] = useState<number | null>(null);
  const heroDirty = useRef(false);
  const statsDirty = useRef(false);
  const storyDirty = useRef(false);
  const diyDirty = useRef(false);
  const teamDirty = useRef(false);
  const contactDirty = useRef(false);
  const ewasteDirty = useRef(false);
  const storySlidesDirty = useRef(false);
  const navDirty = useRef(false);
  const submitCtaDirty = useRef(false);
  const galleryDirty = useRef(false);
  const galleryTilesDirty = useRef(false);

  const isStrong = useMemo(() => password.length >= 8, [password]);

  useEffect(() => {
    let active = true;
    // Check server-side session cookie
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        if (!active) return;
        if (res.ok) setAuthed(true);
        else setAuthed(false);
      } catch {
        if (!active) return;
        setAuthed(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setShowError(true);
        return;
      }
      // server set cookie; allow client UI to reveal console
      setAuthed(true);
      setPassword("");
    } catch (err) {
      setShowError(true);
    }
  };

  useEffect(() => {
    let active = true;
    if (!authed) return;
    fetch("/api/stories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : stories))
      .then((data) => {
        if (active && Array.isArray(data) && !storyDirty.current) {
          setStoryDrafts(data);
          if (data.length > 0 && !data.some((s: { title: string }) => s.title === selectedStory)) {
            setSelectedStory(data[0].title);
          }
        }
      })
      .catch(() => undefined);
    fetch("/api/diy", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : diyProjects))
      .then((data) => {
        if (active && Array.isArray(data) && !diyDirty.current) {
          setDiyDrafts(data);
          if (data.length > 0 && !data.some((p: { name: string }) => p.name === selectedBuild)) {
            setSelectedBuild(data[0].name);
          }
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/site", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (typeof data.heroMessage === "string" && !heroDirty.current) setHeroMessage(data.heroMessage);
        if (Array.isArray(data.stats) && !statsDirty.current) setStatDrafts(data.stats);
        if (Array.isArray(data.teamMembers) && !teamDirty.current) setTeamDrafts(data.teamMembers);
        if (Array.isArray(data.contactChannels) && !contactDirty.current) setContactsDraft(data.contactChannels);
        if (Array.isArray(data.ewasteImages) && !ewasteDirty.current) setEwasteSlides(data.ewasteImages);
        if (Array.isArray(data.storyImages) && !storySlidesDirty.current) setStorySlides(data.storyImages);
        if (Array.isArray(data.navItems) && !navDirty.current) setNavDrafts(data.navItems);
        if (Array.isArray(data.galleryTiles) && !galleryTilesDirty.current) setGalleryTilesDraft(data.galleryTiles);
        if (data.galleryContent && !galleryDirty.current) setGalleryDraft(mergeGalleryContent(data.galleryContent));
        if (data.submitCta && !submitCtaDirty.current) setSubmitCtaDraft((prev) => ({ ...prev, ...data.submitCta }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const scrollToSection = (id: string) => {
    const node = document.getElementById(id);
    if (!node) return;
    setActiveSection(id);
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSectionNav = (id: string) => {
    scrollToSection(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setNavMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    adminNavSections.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [authed]);

  const openPreview = (section: string) => {
    setPreviewSection(section);
    setPreviewOpen(true);
  };

  const getPreviewData = () => {
    return {
      heroMessage,
      stories: storyDrafts,
      diyProjects: diyDrafts,
      teamMembers: teamDrafts,
      stats: statDrafts,
      ewasteImages: ewasteSlides,
      storyImages: storySlides,
      galleryContent: galleryDraft,
      galleryTiles: galleryTilesDraft,
      submitCta: submitCtaDraft,
    };
  };

  const saveSite = async (payload: Record<string, unknown>, setter: (value: string) => void) => {
    setter("Saving...");
    try {
      const res = await fetch("/api/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setter("Saved to backend storage.");
    } catch {
      setter("Save failed. Check server logs.");
    }
  };

  const saveStories = async () => {
    setStoryStatus("Saving...");
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyDrafts),
      });
      if (!res.ok) throw new Error("Failed");
      setStoryStatus("Saved to backend storage.");
    } catch {
      setStoryStatus("Save failed. Check server logs.");
    }
  };

  const saveDiy = async () => {
    setDiyStatus("Saving...");
    try {
      const res = await fetch("/api/diy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diyDrafts),
      });
      if (!res.ok) throw new Error("Failed");
      setDiyStatus("Saved to backend storage.");
    } catch {
      setDiyStatus("Save failed. Check server logs.");
    }
  };

  const updateDiyStatus = (status: string) => {
    diyDirty.current = true;
    setDiyDrafts((prev) =>
      prev.map((p) => (p.name === selectedBuild ? { ...p, status } : p))
    );
    setDiyStatus(`Status set to ${status}.`);
  };

  const updateStoryStatus = (status: string) => {
    storyDirty.current = true;
    setStoryDrafts((prev) =>
      prev.map((s) => (s.title === selectedStory ? { ...s, status } : s))
    );
    setModerationStatus(`Action queued: ${status}.`);
  };

  const uploadPdf = async (file: File, projectName: string) => {
    setUploadStatus("Uploading PDF...");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/pdf", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setDiyDrafts((prev) =>
        prev.map((p) => (p.name === projectName ? { ...p, pdfUrl: data.url } : p))
      );
      setUploadStatus("PDF uploaded. Save DIY to backend.");
    } catch (err) {
      setUploadStatus("Upload failed. Ensure PDF only.");
    }
  };


  const generateStoryWithGemini = async () => {
    setAiStatus("Generating story...");
    try {
      const res = await fetch("/api/gemini/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiStatus(`Story generation failed: ${data?.error || "Unknown error"}`);
        return;
      }
      if (!data?.story?.title) throw new Error("No story returned");
      storyDirty.current = true;
      setStoryDrafts((prev) => [...prev, data.story]);
      setSelectedStory(data.story.title);
      setAiStatus("Story generated. Review and save.");
    } catch {
      setAiStatus("Story generation failed. Check server logs for details.");
    }
  };

  const generateHeroWithGemini = async () => {
    setAiStatus("Generating hero message...");
    try {
      const res = await fetch("/api/gemini/generate-hero", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAiStatus(`Hero generation failed: ${data?.error || "Unknown error"}`);
        return;
      }
      heroDirty.current = true;
      setHeroMessage(data.heroMessage || "");
      setAiStatus("Hero message generated. Save to persist.");
    } catch {
      setAiStatus("Hero generation failed. Check server logs for details.");
    }
  };

  const generateStatsWithGemini = async () => {
    setAiStatus("Generating stats...");
    try {
      const res = await fetch("/api/gemini/generate-stats", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAiStatus(`Stats generation failed: ${data?.error || "Unknown error"}`);
        return;
      }
      if (!Array.isArray(data.stats)) throw new Error("No stats returned");
      statsDirty.current = true;
      setStatDrafts(data.stats);
      setAiStatus("Stats generated. Review and save.");
    } catch {
      setAiStatus("Stats generation failed. Check server logs for details.");
    }
  };

  const generateDiyWithGemini = async () => {
    setAiStatus("Generating DIY guide...");
    try {
      const res = await fetch("/api/gemini/generate-diy", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAiStatus(`DIY generation failed: ${data?.error || "Unknown error"}`);
        return;
      }
      if (!data?.project?.name) throw new Error("No project returned");
      diyDirty.current = true;
      setDiyDrafts((prev) => [...prev, data.project]);
      setSelectedBuild(data.project.name);
      setAiStatus("DIY guide generated. Review and save.");
    } catch {
      setAiStatus("DIY generation failed. Check server logs for details.");
    }
  };

  const generateDiyPdfWithGemini = async (projectName: string) => {
    const project = diyDrafts.find((p) => p.name === projectName);
    if (!project) {
      setUploadStatus("Select a DIY guide first.");
      return;
    }
    setUploadStatus("Generating PDF...");
    try {
      const res = await fetch("/api/gemini/generate-diy-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadStatus(`PDF generation failed: ${data?.error || "Unknown error"}`);
        return;
      }
      if (!data?.url) throw new Error("No PDF URL returned");
      diyDirty.current = true;
      setDiyDrafts((prev) =>
        prev.map((p) => (p.name === projectName ? { ...p, pdfUrl: data.url } : p))
      );
      setUploadStatus("PDF generated! Save DIY to persist.");
    } catch {
      setUploadStatus("PDF generation failed. Check server logs.");
    }
  };

  const moderateStoryWithGemini = async (story: {
    title?: string;
    excerpt?: string;
    body?: string;
    status?: string;
  }) => {
    setAiStatus("Moderating story...");
    try {
      const res = await fetch("/api/gemini/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${story.title ?? ""}\n${story.excerpt ?? ""}\n${story.body ?? ""}`.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiStatus(`Moderation failed: ${data?.error || "Unknown error"}`);
        return;
      }
      const nextStatus = data?.allowed ? "active" : "needs-review";
      storyDirty.current = true;
      setStoryDrafts((prev) =>
        prev.map((s) =>
          s.title === story.title ? { ...s, status: nextStatus } : s
        )
      );
      setModerationStatus(
        data?.summary
          ? `Moderation: ${data.summary}`
          : `Moderation complete: ${nextStatus}.`
      );
      setAiStatus("Moderation complete.");
    } catch {
      setAiStatus("Moderation failed. Check server logs for details.");
    }
  };


  const uploadImage = async (file: File) => {
    setUploadStatus("Uploading image...");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setUploadStatus("Image uploaded.");
      return data.url as string;
    } catch {
      setUploadStatus("Image upload failed.");
      return "";
    }
  };

  const addGalleryTile = () => {
    galleryTilesDirty.current = true;
    const newTile: GalleryTile = {
      id: `tile-${Date.now()}`,
      title: "New gallery tile",
      description: "",
      src: "",
      size: "square",
    };
    setGalleryTilesDraft((prev) => [...prev, newTile]);
    setGalleryTilesStatus("Tile added. Fill in details and save.");
  };

  const updateGalleryTile = (tileId: string, patch: Partial<GalleryTile>) => {
    galleryTilesDirty.current = true;
    setGalleryTilesDraft((prev) => prev.map((tile) => (tile.id === tileId ? { ...tile, ...patch } : tile)));
  };

  const removeGalleryTile = (tileId: string) => {
    galleryTilesDirty.current = true;
    setGalleryTilesDraft((prev) => prev.filter((tile) => tile.id !== tileId));
    setGalleryTilesStatus("Tile removed. Save gallery grid to publish.");
  };

  const uploadTileImage = async (file: File, tileId: string) => {
    // Find the tile to get its size
    const tile = galleryTilesDraft.find((t) => t.id === tileId);
    if (!tile) {
      setGalleryTilesStatus("Tile not found.");
      return;
    }

    // Open crop modal instead of auto-uploading
    setCropTarget("gallery");
    setCropImageFile(file);
    setCropTileId(tileId);
    setCropTileSize(tile.size as GalleryTileSize);
    setCropModalOpen(true);
  };

  const uploadStoryImage = (file: File, index: number) => {
    setCropTarget("story");
    setCropStoryIndex(index);
    setCropImageFile(file);
    setCropTileSize("landscape");
    setCropModalOpen(true);
  };

  const uploadSlideshowImage = (file: File, type: "ewaste" | "storyslide") => {
    setCropTarget(type);
    setCropSlideIndex(0);
    setCropImageFile(file);
    setCropTileSize("landscape");
    setCropModalOpen(true);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (cropTarget === "gallery") {
      setGalleryTilesStatus("Uploading cropped image...");
    } else if (cropTarget === "ewaste") {
      setHeroStatus("Uploading e-waste image...");
    } else if (cropTarget === "storyslide") {
      setStoryStatus("Uploading story image...");
    } else {
      setStoryStatus("Uploading story image...");
    }
    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], "cropped-image.png", {
        type: "image/png",
      });
      const form = new FormData();
      form.append("file", croppedFile);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      if (cropTarget === "gallery") {
        updateGalleryTile(cropTileId, { src: data.url });
        setGalleryTilesStatus("Image uploaded. Save gallery grid to publish.");
      } else if (cropTarget === "story" && cropStoryIndex !== null) {
        storyDirty.current = true;
        setStoryDrafts((prev) =>
          prev.map((story, idx) =>
            idx === cropStoryIndex ? { ...story, imageUrl: data.url } : story
          )
        );
        setStoryStatus("Story image uploaded. Save stories to publish.");
      } else if (cropTarget === "ewaste") {
        ewasteDirty.current = true;
        setEwasteSlides((prev) => [...prev, data.url]);
        setHeroStatus("E-waste image uploaded. Save slideshows to publish.");
      } else if (cropTarget === "storyslide") {
        storySlidesDirty.current = true;
        setStorySlides((prev) => [...prev, data.url]);
        setStoryStatus("Story image uploaded. Save slideshows to publish.");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      if (cropTarget === "gallery") {
        setGalleryTilesStatus("Image upload failed. Check file and try again.");
      } else if (cropTarget === "ewaste") {
        setHeroStatus("Image upload failed. Check file and try again.");
      } else {
        setStoryStatus("Image upload failed. Check file and try again.");
      }
    }
  };

  const addStat = () => {
    statsDirty.current = true;
    setStatDrafts((prev) => [...prev, { label: "New stat", value: "0", detail: "" }]);
    setStatsStatus("New stat added. Edit and save.");
  };

  const addDiy = () => {
    diyDirty.current = true;
    const nextName = `New guide ${diyDrafts.length + 1}`;
    const nextProject = {
      name: nextName,
      difficulty: "Starter",
      time: "30 minutes",
      outcome: "",
      status: "draft",
      imageUrl: "",
      steps: ["Step 1", "Step 2", "Step 3"],
      impact: "",
      pdfUrl: "/pdfs/new-guide.pdf",
    };
    setDiyDrafts((prev) => [...prev, nextProject]);
    setSelectedBuild(nextName);
    setDiyStatus("New guide added. Fill in details and save.");
  };

  const addStory = () => {
    storyDirty.current = true;
    const nextTitle = `New story ${storyDrafts.length + 1}`;
    const nextStory = {
      title: nextTitle,
      slug: slugify(nextTitle),
      category: "Learning",
      excerpt: "",
      body: "",
      author: "",
      time: "4 min read",
      status: "draft",
      imageUrl: "",
      tags: ["community"],
    };
    setStoryDrafts((prev) => [...prev, nextStory]);
    setSelectedStory(nextTitle);
    setStoryStatus("New story added. Fill in details and save.");
  };

  const addTeamMember = () => {
    teamDirty.current = true;
    setTeamDrafts((prev) => [
      ...prev,
      {
        name: "New member",
        role: "Role",
        focus: "",
        avatar: "NM",
        imageUrl: "",
        socials: [{ label: "LinkedIn", url: "https://linkedin.com" }],
      },
    ]);
    setTeamStatus("New team member added. Fill in details and save.");
  };

  const addContactChannel = () => {
    contactDirty.current = true;
    setContactsDraft((prev) => [
      ...prev,
      {
        label: "New channel",
        detail: "",
        href: "",
      },
    ]);
    setContactStatus("New contact channel added. Fill in details and save.");
  };

  const addEwasteSlide = () => {
    ewasteDirty.current = true;
    setEwasteSlides((prev) => [...prev, "https://images.pexels.com/photos/"]);
    setHeroStatus("Add e-waste slideshow image and save.");
  };

  const addStorySlide = () => {
    storySlidesDirty.current = true;
    setStorySlides((prev) => [...prev, "https://images.pexels.com/photos/"]);
    setStoryStatus("Add story slideshow image and save.");
  };

  const removeStat = (index: number) => {
    statsDirty.current = true;
    setStatDrafts((prev) => prev.filter((_, idx) => idx !== index));
    setStatsStatus("Stat removed. Save to persist.");
  };

  const removeEwasteSlide = (index: number) => {
    ewasteDirty.current = true;
    setEwasteSlides((prev) => prev.filter((_, idx) => idx !== index));
    setHeroStatus("Image removed. Save slideshows to persist.");
  };

  const removeStorySlide = (index: number) => {
    storySlidesDirty.current = true;
    setStorySlides((prev) => prev.filter((_, idx) => idx !== index));
    setStoryStatus("Image removed. Save slideshows to persist.");
  };

  const removeDiy = (name: string) => {
    diyDirty.current = true;
    setDiyDrafts((prev) => {
      const next = prev.filter((p) => p.name !== name);
      if (selectedBuild === name) {
        setSelectedBuild(next[0]?.name ?? "");
      }
      return next;
    });
    setDiyStatus("DIY removed. Save to persist.");
  };

  const removeStory = (title: string) => {
    storyDirty.current = true;
    setStoryDrafts((prev) => {
      const next = prev.filter((s) => s.title !== title);
      if (selectedStory === title) {
        setSelectedStory(next[0]?.title ?? "");
      }
      return next;
    });
    setStoryStatus("Story removed. Save to persist.");
  };

  const removeTeamMember = (index: number) => {
    teamDirty.current = true;
    setTeamDrafts((prev) => prev.filter((_, idx) => idx !== index));
    setTeamStatus("Member removed. Save to persist.");
  };

  const removeContactChannel = (index: number) => {
    contactDirty.current = true;
    setContactsDraft((prev) => prev.filter((_, idx) => idx !== index));
    setContactStatus("Channel removed. Save to persist.");
  };

  const addNavItem = () => {
    navDirty.current = true;
    setNavDrafts((prev) => [...prev, { label: "New link", href: "/" }]);
    setNavStatus("Nav link added. Save to persist.");
  };

  const removeNavItem = (index: number) => {
    navDirty.current = true;
    setNavDrafts((prev) => prev.filter((_, idx) => idx !== index));
    setNavStatus("Nav link removed. Save to persist.");
  };

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 pb-20 pt-16 sm:px-10 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="E-Made logo"
            width={72}
            height={72}
            className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Stewardship</p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">Community control room.</h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Password-gated controls for local stewards. Edit every page (hero, forum, DIY, team, footer), publish free playbooks, and validate community signals before they surface.
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/">
          Back home
        </Link>
      </header>

      {authed === null ? (
        <div className="glass flex items-center justify-center rounded-3xl p-6">
          <span className="text-sm text-slate-300">Checking access…</span>
        </div>
      ) : !authed ? (
        <form
          onSubmit={onSubmit}
          className="glass flex flex-col gap-4 rounded-3xl border border-white/10 p-6"
        >
          <label className="text-sm text-slate-200" htmlFor="password">
            Enter stewardship key
          </label>
          <input
            id="password"
            type="password"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-lime-400/70"
            placeholder="Enter shared secret"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={showError}
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{isStrong ? "Strength: good" : "Use 8+ characters"}</span>
            {/* hint removed for production and dev */}
          </div>
          {showError && (
            <p className="text-sm text-red-300">
              Incorrect key. Verify the shared secret or rotate it in env.
            </p>
          )}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Enter console
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setPassword("");
                setShowError(false);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      ) : (
        <>
          {navMenuOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setNavMenuOpen(false)}
              aria-hidden="true"
            />
          )}
          <button
            type="button"
            onClick={() => setNavMenuOpen((prev) => !prev)}
            aria-expanded={navMenuOpen}
            aria-controls="admin-section-nav"
            className={`glass fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-xl font-semibold text-white transition hover:bg-white/10 lg:hidden ${
              navMenuOpen ? "bg-white/20" : "bg-white/5"
            }`}
          >
            <span className="sr-only">
              {navMenuOpen ? "Hide section shortcuts" : "Show section shortcuts"}
            </span>
            <span aria-hidden="true" className="block w-full text-center text-2xl leading-none">
              ...
            </span>
          </button>
          {navMenuOpen && (
            <aside
              id="admin-section-nav"
              className="glass fixed inset-x-6 bottom-24 z-40 max-h-[70vh] overflow-y-auto rounded-3xl border border-white/10 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] transition-all duration-200 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[24rem] lg:left-auto lg:right-12"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Sections</p>
                  <p className="mt-1 text-sm text-slate-400">Jump to any block.</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white transition hover:bg-white/10"
                  onClick={() => setNavMenuOpen(false)}
                >
                  Close
                </button>
              </div>
              <nav className="mt-4 flex flex-col gap-2">
                {adminNavSections.map((section) => {
                  const active = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleSectionNav(section.id)}
                      className={`w-full rounded-xl px-4 py-2 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 ${
                        active
                          ? "bg-white/20 text-white shadow-[0_12px_30px_-24px_rgba(158,240,26,0.6)]"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </aside>
          )}
          <div className="flex flex-col gap-6">
            <div className="flex-1 space-y-8">
          <section id="gallery" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Gallery</p>
                <h3 className="text-2xl font-semibold text-white">Gallery storytelling</h3>
              </div>
              <span className="chip bg-white/10 text-xs text-slate-200">/gallery</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                placeholder="Hero eyebrow"
                value={galleryDraft.hero.eyebrow}
                onChange={(e) => {
                  galleryDirty.current = true;
                  const nextValue = e.target.value;
                  setGalleryDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, eyebrow: nextValue },
                  }));
                }}
              />
              <input
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70 sm:col-span-2"
                placeholder="Hero title"
                value={galleryDraft.hero.title}
                onChange={(e) => {
                  galleryDirty.current = true;
                  const nextValue = e.target.value;
                  setGalleryDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title: nextValue },
                  }));
                }}
              />
              <textarea
                className="sm:col-span-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                placeholder="Hero description"
                rows={3}
                value={galleryDraft.hero.description}
                onChange={(e) => {
                  galleryDirty.current = true;
                  const nextValue = e.target.value;
                  setGalleryDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, description: nextValue },
                  }));
                }}
              />
            </div>
            <div className="mt-6 space-y-4">
              {galleryDraft.sections.map((section, idx) => (
                <div key={section.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Section</p>
                    <span className="chip bg-white/10 text-[10px] text-slate-300">{section.id}</span>
                  </div>
                  <input
                    className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Eyebrow"
                    value={section.eyebrow}
                    onChange={(e) => {
                      galleryDirty.current = true;
                      const nextValue = e.target.value;
                      setGalleryDraft((prev) => ({
                        ...prev,
                        sections: prev.sections.map((sec, sectionIdx) =>
                          sectionIdx === idx ? { ...sec, eyebrow: nextValue } : sec
                        ),
                      }));
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Title"
                    value={section.title}
                    onChange={(e) => {
                      galleryDirty.current = true;
                      const nextValue = e.target.value;
                      setGalleryDraft((prev) => ({
                        ...prev,
                        sections: prev.sections.map((sec, sectionIdx) =>
                          sectionIdx === idx ? { ...sec, title: nextValue } : sec
                        ),
                      }));
                    }}
                  />
                  <textarea
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Optional description"
                    rows={2}
                    value={section.description ?? ""}
                    onChange={(e) => {
                      galleryDirty.current = true;
                      const nextValue = e.target.value;
                      setGalleryDraft((prev) => ({
                        ...prev,
                        sections: prev.sections.map((sec, sectionIdx) =>
                          sectionIdx === idx ? { ...sec, description: nextValue } : sec
                        ),
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Grid tiles</p>
                  <h4 className="text-xl font-semibold text-white">Gallery boxes & sizes</h4>
                  <p className="text-xs text-slate-400">
                    Add collage tiles, paste remote URLs, or upload local assets from /uploads.
                  </p>
                </div>
                <button type="button" className="btn-ghost" onClick={addGalleryTile}>
                  Add tile
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {galleryTilesDraft.map((tile, idx) => (
                  <div key={tile.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Tile</p>
                        <p className="text-sm text-white">{tile.title || `Tile ${idx + 1}`}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={tile.size}
                          className="rounded-xl border border-white/20 bg-white px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-900 outline-none focus:border-lime-400/70 dark:bg-black/60 dark:text-white"
                          onChange={(e) => updateGalleryTile(tile.id, { size: e.target.value as GalleryTileSize })}
                        >
                          {galleryTileSizeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => removeGalleryTile(tile.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-slate-500">
                      {galleryTileSizeOptions.find((opt) => opt.value === tile.size)?.detail}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                        placeholder="Title"
                        value={tile.title}
                        onChange={(e) => updateGalleryTile(tile.id, { title: e.target.value })}
                      />
                      <input
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                        placeholder="Image URL or /uploads path"
                        value={tile.src}
                        onChange={(e) => updateGalleryTile(tile.id, { src: e.target.value })}
                      />
                    </div>
                    <textarea
                      className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      placeholder="Description"
                      rows={2}
                      value={tile.description}
                      onChange={(e) => updateGalleryTile(tile.id, { description: e.target.value })}
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <input
                        id={`gallery-tile-upload-${idx}`}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          uploadTileImage(file, tile.id);
                          e.target.value = "";
                        }}
                      />
                      <label
                        htmlFor={`gallery-tile-upload-${idx}`}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40"
                      >
                        Upload image
                      </label>
                      <span className="text-xs text-slate-400">or paste a hosted URL above</span>
                    </div>
                    {tile.src && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                        <img src={tile.src} alt={tile.title || "Gallery tile preview"} className="h-48 w-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
                {galleryTilesDraft.length === 0 && (
                  <p className="text-sm text-slate-400">No tiles yet. Click “Add tile” to start building the collage.</p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => saveSite({ galleryTiles: galleryTilesDraft }, setGalleryTilesStatus)}
                >
                  Save gallery grid
                </button>
                <span className="text-xs text-slate-400">{galleryTilesStatus}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveSite({ galleryContent: galleryDraft }, setGalleryStatus)}
              >
                Save gallery copy
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("gallery")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{galleryStatus}</span>
            </div>
          </section>

          <section id="hero" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Hero message</p>
                <h3 className="text-2xl font-semibold text-white">Above-the-fold promise</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border border-white/20 bg-white/10"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Publish to site
              </label>
            </div>
            <textarea
              className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-lime-400/70"
              rows={3}
              value={heroMessage}
              onChange={(e) => {
                heroDirty.current = true;
                setHeroMessage(e.target.value);
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveSite({ heroMessage }, setHeroStatus)}
              >
                Save draft
              </button>
              <button type="button" className="btn-ghost" onClick={generateHeroWithGemini}>
                Generate hero (AI)
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => saveSite({ heroMessage }, setHeroStatus)}
              >
                Ship live
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("hero")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{heroStatus}</span>
              <span className="text-xs text-slate-400">{aiStatus}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Changes are saved to backend storage when you click the save buttons.
            </p>
          </section>

          <section id="stats" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Stats</p>
                <h3 className="text-2xl font-semibold text-white">Impact counters</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip bg-white/10 text-xs text-slate-200">Site-wide</span>
                <button type="button" className="btn-ghost" onClick={addStat}>
                  Add stat
                </button>
                <button type="button" className="btn-ghost" onClick={generateStatsWithGemini}>
                  Generate stats (AI)
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {statDrafts.map((item, idx) => (
                <div key={`stat-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => removeStat(idx)}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={item.label}
                    onChange={(e) => {
                      statsDirty.current = true;
                      const next = [...statDrafts];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setStatDrafts(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-lg font-semibold text-white outline-none focus:border-lime-400/70"
                    value={item.value}
                    onChange={(e) => {
                      statsDirty.current = true;
                      const next = [...statDrafts];
                      next[idx] = { ...next[idx], value: e.target.value };
                      setStatDrafts(next);
                    }}
                  />
                  <textarea
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={item.detail}
                    onChange={(e) => {
                      statsDirty.current = true;
                      const next = [...statDrafts];
                      next[idx] = { ...next[idx], detail: e.target.value };
                      setStatDrafts(next);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveSite({ stats: statDrafts }, setStatsStatus)}
              >
                Save stats to backend
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("stats")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{statsStatus}</span>
              <span className="text-xs text-slate-400">{aiStatus}</span>
            </div>
          </section>

          <section id="slideshows" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Slideshows</p>
                <h3 className="text-2xl font-semibold text-white">Homepage & stories images</h3>
              </div>
              <span className="chip bg-white/10 text-xs text-slate-200">Site-wide</span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-300">E-waste slideshow</p>
                  <button type="button" className="btn-ghost" onClick={addEwasteSlide}>
                    Add image
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <input
                    id="ewaste-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      uploadSlideshowImage(file, "ewaste");
                      e.target.value = "";
                    }}
                  />
                  <label
                    htmlFor="ewaste-upload"
                    className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40"
                  >
                    Upload from PC
                  </label>
                </div>
                <div className="mt-2 grid gap-2">
                  {ewasteSlides.map((src, idx) => (
                    <div key={`ewaste-${idx}`} className="flex flex-wrap items-center gap-2">
                      <input
                        className="w-full flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                        value={src}
                        onChange={(e) => {
                          ewasteDirty.current = true;
                          const next = [...ewasteSlides];
                          next[idx] = e.target.value;
                          setEwasteSlides(next);
                        }}
                      />
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => removeEwasteSlide(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-300">Story slideshow</p>
                  <button type="button" className="btn-ghost" onClick={addStorySlide}>
                    Add image
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <input
                    id="story-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      uploadSlideshowImage(file, "storyslide");
                      e.target.value = "";
                    }}
                  />
                  <label
                    htmlFor="story-upload"
                    className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40"
                  >
                    Upload from PC
                  </label>
                </div>
                <div className="mt-2 grid gap-2">
                  {storySlides.map((src, idx) => (
                    <div key={`story-${idx}`} className="flex flex-wrap items-center gap-2">
                      <input
                        className="w-full flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                        value={src}
                        onChange={(e) => {
                          storySlidesDirty.current = true;
                          const next = [...storySlides];
                          next[idx] = e.target.value;
                          setStorySlides(next);
                        }}
                      />
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => removeStorySlide(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  saveSite(
                    { ewasteImages: ewasteSlides, storyImages: storySlides },
                    setHeroStatus
                  )
                }
              >
                Save slideshows to backend
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("slideshows")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{heroStatus}</span>
            </div>
          </section>

          <section id="diy" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Blueprints</p>
                <h3 className="text-2xl font-semibold text-white">Publish a DIY build (PDF)</h3>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <select
                  value={selectedBuild}
                  onChange={(e) => setSelectedBuild(e.target.value)}
                  className="w-full sm:w-[260px] rounded-xl border border-white/20 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)] outline-none focus:border-lime-400/70 dark:bg-black/60 dark:text-white"
                >
                  {diyDrafts.map((project) => (
                    <option key={project.name}>{project.name}</option>
                  ))}
                </select>
                <button type="button" className="btn-ghost" onClick={addDiy}>
                  Add DIY guide
                </button>
                <button type="button" className="btn-ghost" onClick={generateDiyWithGemini}>
                  Generate DIY (AI)
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => selectedBuild && removeDiy(selectedBuild)}
                  disabled={!selectedBuild}
                >
                  Remove guide
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button type="button" className="btn-primary" onClick={() => updateDiyStatus("published")}> 
                Push PDF live
              </button>
              <button
                type="button"
                className="btn-ghost"
                  onClick={() => updateDiyStatus("qa")}
              >
                Schedule QA
              </button>
              <button
                type="button"
                className="btn-ghost"
                  onClick={() => updateDiyStatus("archived")}
              >
                Archive
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Update BOM, safety checks, and distribution lists before publishing. All downloads are free PDFs.
            </p>
            {diyDrafts
              .filter((p) => p.name === selectedBuild)
              .map((project, idx) => (
                <div key={`diy-${idx}`} className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={project.name}
                    onChange={(e) => {
                      diyDirty.current = true;
                      const nextName = e.target.value;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, name: nextName } : p
                        )
                      );
                      setSelectedBuild(nextName);
                    }}
                  />
                  <input
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={project.difficulty}
                    onChange={(e) => {
                      diyDirty.current = true;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, difficulty: e.target.value } : p
                        )
                      );
                    }}
                  />
                  <input
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={project.time}
                    onChange={(e) => {
                      diyDirty.current = true;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, time: e.target.value } : p
                        )
                      );
                    }}
                  />
                  <input
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={project.pdfUrl}
                    onChange={(e) => {
                      diyDirty.current = true;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, pdfUrl: e.target.value } : p
                        )
                      );
                    }}
                  />
                  <input
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Image URL (cover)"
                    value={project.imageUrl ?? ""}
                    onChange={(e) => {
                      diyDirty.current = true;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, imageUrl: e.target.value } : p
                        )
                      );
                    }}
                  />
                  <input
                    id={`diy-image-upload-${idx}`}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadImage(file);
                      if (!url) return;
                      diyDirty.current = true;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, imageUrl: url } : p
                        )
                      );
                    }}
                  />
                  <label
                    htmlFor={`diy-image-upload-${idx}`}
                    className="col-span-full inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40"
                  >
                    Upload guide image
                  </label>
                  <textarea
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={project.outcome}
                    onChange={(e) => {
                      diyDirty.current = true;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, outcome: e.target.value } : p
                        )
                      );
                    }}
                  />
                  <textarea
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70 sm:col-span-2"
                    value={project.steps.join("\n")}
                    onChange={(e) => {
                      diyDirty.current = true;
                      const steps = e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean);
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, steps } : p
                        )
                      );
                    }}
                  />
                  <input
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70 sm:col-span-2"
                    value={project.impact}
                    onChange={(e) => {
                      diyDirty.current = true;
                      setDiyDrafts((prev) =>
                        prev.map((p) =>
                          p.name === project.name ? { ...p, impact: e.target.value } : p
                        )
                      );
                    }}
                  />
                  <input
                    id={`pdf-upload-${idx}`}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      uploadPdf(file, project.name);
                    }}
                  />
                  <label
                    htmlFor={`pdf-upload-${idx}`}
                    className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40"
                  >
                    Upload PDF file
                  </label>
                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300 transition hover:border-lime-400/70 hover:bg-lime-400/20"
                    onClick={() => generateDiyPdfWithGemini(project.name)}
                  >
                    Generate PDF (AI)
                  </button>
                </div>
              ))}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={saveDiy}>
                Save DIY to backend
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("diy")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{diyStatus}</span>
              <span className="text-xs text-slate-400">{uploadStatus}</span>
            </div>
          </section>

          <section id="moderation" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Signal review</p>
                <h3 className="text-2xl font-semibold text-white">Forum moderation</h3>
              </div>
              <span className="chip bg-white/10 text-lime-200">Human-in-the-loop</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Escalate breakthrough", "Request evidence", "Archive complete"].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    updateStoryStatus(
                      action === "Archive complete" ? "archived" : action === "Request evidence" ? "needs-evidence" : "breakthrough"
                    )
                  }
                >
                  {action}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">{moderationStatus}</p>
            <p className="mt-3 text-xs text-slate-400">
              Pair this UI with your moderation API or Supabase policy for real workflows.
            </p>
            <div className="mt-3">
              <button type="button" className="btn-primary" onClick={saveStories}>
                Apply moderation to backend
              </button>
            </div>
          </section>

          <section id="stories" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Stories</p>
                <h3 className="text-2xl font-semibold text-white">Forum stories</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="btn-ghost" onClick={addStory}>
                  Add story
                </button>
                <button type="button" className="btn-ghost" onClick={generateStoryWithGemini}>
                  Generate story (AI)
                </button>
              </div>
            </div>
            <div className="mt-3">
              <select
                value={selectedStory}
                onChange={(e) => setSelectedStory(e.target.value)}
                className="w-full sm:w-[320px] rounded-xl border border-white/20 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)] outline-none focus:border-lime-400/70 dark:bg-black/60 dark:text-white"
              >
                <option value="">Select a story to edit...</option>
                {storyDrafts.map((story) => (
                  <option key={story.title} value={story.title}>{story.title}</option>
                ))}
              </select>
              <div className="mt-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => selectedStory && removeStory(selectedStory)}
                  disabled={!selectedStory}
                >
                  Remove story
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {storyDrafts
                .filter((story) => story.title === selectedStory)
                .map((story, idx) => (
                  <div key={`story-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <input
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      placeholder="Story title"
                      value={story.title}
                      onChange={(e) => {
                        storyDirty.current = true;
                        const nextTitle = e.target.value;
                        setStoryDrafts((prev) =>
                          prev.map((s) =>
                            s.title === story.title ? { ...s, title: nextTitle } : s
                          )
                        );
                        setSelectedStory(nextTitle);
                      }}
                    />
                    <input
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      placeholder="Slug (url-friendly)"
                      value={story.slug ?? ""}
                      onChange={(e) => {
                        storyDirty.current = true;
                        setStoryDrafts((prev) =>
                          prev.map((s) =>
                            s.title === story.title
                              ? { ...s, slug: slugify(e.target.value) }
                              : s
                          )
                        );
                      }}
                    />
                    <input
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      placeholder="Category (e.g., Learning, Privacy, Safety)"
                      value={story.category}
                      onChange={(e) => {
                        storyDirty.current = true;
                        setStoryDrafts((prev) =>
                          prev.map((s) =>
                            s.title === story.title ? { ...s, category: e.target.value } : s
                          )
                        );
                      }}
                    />
                    <textarea
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      rows={3}
                      placeholder="Story excerpt"
                      value={story.excerpt}
                      onChange={(e) => {
                        storyDirty.current = true;
                        setStoryDrafts((prev) =>
                          prev.map((s) =>
                            s.title === story.title ? { ...s, excerpt: e.target.value } : s
                          )
                        );
                      }}
                    />
                    <textarea
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      rows={5}
                      placeholder="Full story body"
                      value={story.body}
                      onChange={(e) => {
                        storyDirty.current = true;
                        setStoryDrafts((prev) =>
                          prev.map((s) =>
                            s.title === story.title ? { ...s, body: e.target.value } : s
                          )
                        );
                      }}
                    />
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <input
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                        placeholder="Author name"
                        value={story.author}
                        onChange={(e) => {
                          storyDirty.current = true;
                          setStoryDrafts((prev) =>
                            prev.map((s) =>
                              s.title === story.title ? { ...s, author: e.target.value } : s
                            )
                          );
                        }}
                      />
                      <input
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                        placeholder="Read time (e.g., 3 min read)"
                        value={story.time}
                        onChange={(e) => {
                          storyDirty.current = true;
                          setStoryDrafts((prev) =>
                            prev.map((s) =>
                              s.title === story.title ? { ...s, time: e.target.value } : s
                            )
                          );
                        }}
                      />
                    </div>
                    <input
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      placeholder="Tags (comma-separated, e.g., privacy, reuse, Accra)"
                      value={story.tags.join(", ")}
                      onChange={(e) => {
                        storyDirty.current = true;
                        const tags = e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean);
                        setStoryDrafts((prev) =>
                          prev.map((s) =>
                            s.title === story.title ? { ...s, tags } : s
                          )
                        );
                      }}
                    />
                    <input
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                      placeholder="Image URL (cover)"
                      value={story.imageUrl ?? ""}
                      onChange={(e) => {
                        storyDirty.current = true;
                        setStoryDrafts((prev) =>
                          prev.map((s) =>
                            s.title === story.title ? { ...s, imageUrl: e.target.value } : s
                          )
                        );
                      }}
                    />
                    <input
                      id={`story-image-upload-${idx}`}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        uploadStoryImage(file, idx);
                      }}
                    />
                    <label
                      htmlFor={`story-image-upload-${idx}`}
                      className="mt-2 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/40"
                    >
                      Upload story image
                    </label>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => moderateStoryWithGemini(story)}
                      >
                        Moderate (AI)
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={saveStories}>
                Save stories to backend
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("stories")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{storyStatus}</span>
              <span className="text-xs text-slate-400">{aiStatus}</span>
            </div>
          </section>

          <section id="team" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Team</p>
                <h3 className="text-2xl font-semibold text-white">Profiles & socials</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip bg-white/10 text-xs text-slate-200">Visible on /team</span>
                <button type="button" className="btn-ghost" onClick={addTeamMember}>
                  Add member
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {teamDrafts.map((member, idx) => (
                <div key={`team-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => removeTeamMember(idx)}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={member.name}
                    onChange={(e) => {
                      teamDirty.current = true;
                      const next = [...teamDrafts];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setTeamDrafts(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={member.role}
                    onChange={(e) => {
                      teamDirty.current = true;
                      const next = [...teamDrafts];
                      next[idx] = { ...next[idx], role: e.target.value };
                      setTeamDrafts(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={member.avatar}
                    onChange={(e) => {
                      teamDirty.current = true;
                      const next = [...teamDrafts];
                      next[idx] = { ...next[idx], avatar: e.target.value };
                      setTeamDrafts(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Image URL (optional)"
                    value={member.imageUrl ?? ""}
                    onChange={(e) => {
                      teamDirty.current = true;
                      const next = [...teamDrafts];
                      next[idx] = { ...next[idx], imageUrl: e.target.value };
                      setTeamDrafts(next);
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-xs text-slate-300"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        teamDirty.current = true;
                        const next = [...teamDrafts];
                        next[idx] = { ...next[idx], imageUrl: String(reader.result) };
                        setTeamDrafts(next);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <textarea
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={member.focus}
                    onChange={(e) => {
                      teamDirty.current = true;
                      const next = [...teamDrafts];
                      next[idx] = { ...next[idx], focus: e.target.value };
                      setTeamDrafts(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Socials: Label:URL, Label:URL (e.g., LinkedIn:https://linkedin.com, GitHub:https://github.com)"
                    defaultValue={(member.socials ?? [])
                      .map((social) => `${social.label}:${social.url}`)
                      .join(", ")}
                    onBlur={(e) => {
                      const socials = e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((item) => {
                          const [label, ...rest] = item.split(":");
                          const url = rest.join(":");
                          if (!label || !url) return null;
                          return { label: label.trim(), url: url.trim() };
                        })
                        .filter(
                          (item): item is { label: string; url: string } =>
                            Boolean(item)
                        );
                      teamDirty.current = true;
                      const next = [...teamDrafts];
                      next[idx] = { ...next[idx], socials };
                      setTeamDrafts(next);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveSite({ teamMembers: teamDrafts }, setTeamStatus)}
              >
                Save team to backend
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("team")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{teamStatus}</span>
            </div>
          </section>

          <section id="contact" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Contact</p>
                <h3 className="text-2xl font-semibold text-white">Channels & social</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip bg-white/10 text-xs text-slate-200">Shown on /contact</span>
                <button type="button" className="btn-ghost" onClick={addContactChannel}>
                  Add channel
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {contactsDraft.map((c, idx) => (
                <div key={`contact-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => removeContactChannel(idx)}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={c.label}
                    onChange={(e) => {
                      contactDirty.current = true;
                      const next = [...contactsDraft];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setContactsDraft(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={c.detail}
                    onChange={(e) => {
                      contactDirty.current = true;
                      const next = [...contactsDraft];
                      next[idx] = { ...next[idx], detail: e.target.value };
                      setContactsDraft(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    value={c.href}
                    onChange={(e) => {
                      contactDirty.current = true;
                      const next = [...contactsDraft];
                      next[idx] = { ...next[idx], href: e.target.value };
                      setContactsDraft(next);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveSite({ contactChannels: contactsDraft }, setContactStatus)}
              >
                Save contact to backend
              </button>
              <span className="text-xs text-slate-400">{contactStatus}</span>
            </div>
          </section>

          <section id="site-navigation" className="glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Navigation</p>
                <h3 className="text-2xl font-semibold text-white">Header links</h3>
              </div>
              <button type="button" className="btn-ghost" onClick={addNavItem}>
                Add link
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {navDrafts.map((item, idx) => (
                <div key={`nav-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => removeNavItem(idx)}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => {
                      navDirty.current = true;
                      const next = [...navDrafts];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setNavDrafts(next);
                    }}
                  />
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                    placeholder="Href (e.g., /gallery)"
                    value={item.href}
                    onChange={(e) => {
                      navDirty.current = true;
                      const next = [...navDrafts];
                      next[idx] = { ...next[idx], href: e.target.value };
                      setNavDrafts(next);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveSite({ navItems: navDrafts }, setNavStatus)}
              >
                Save nav to backend
              </button>
              <span className="text-xs text-slate-400">{navStatus}</span>
            </div>
          </section>

          <section id="submit-cta" className="glass rounded-3xl border border-lime-400/20 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Community Submissions</p>
              <h3 className="text-2xl font-semibold text-white">Submit CTA</h3>
              <p className="text-sm text-slate-400 mt-1">Edit the call-to-action for community ads & ideas</p>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400">Title</label>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                  placeholder="CTA title"
                  value={submitCtaDraft.title}
                  onChange={(e) => {
                    submitCtaDirty.current = true;
                    setSubmitCtaDraft((prev) => ({ ...prev, title: e.target.value }));
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                  placeholder="CTA description"
                  rows={2}
                  value={submitCtaDraft.description}
                  onChange={(e) => {
                    submitCtaDirty.current = true;
                    setSubmitCtaDraft((prev) => ({ ...prev, description: e.target.value }));
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Submission email</label>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                  placeholder="submit@emade.org"
                  type="email"
                  value={submitCtaDraft.email}
                  onChange={(e) => {
                    submitCtaDirty.current = true;
                    setSubmitCtaDraft((prev) => ({ ...prev, email: e.target.value }));
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Button text</label>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
                  placeholder="Send us your idea"
                  value={submitCtaDraft.buttonText}
                  onChange={(e) => {
                    submitCtaDirty.current = true;
                    setSubmitCtaDraft((prev) => ({ ...prev, buttonText: e.target.value }));
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveSite({ submitCta: submitCtaDraft }, setSubmitCtaStatus)}
              >
                Save CTA to backend
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => openPreview("submit-cta")}
              >
                👁 Preview
              </button>
              <span className="text-xs text-slate-400">{submitCtaStatus}</span>
            </div>
          </section>
          </div>
        </div>
        <AdminPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          section={previewSection}
          data={getPreviewData()}
        />
        <ImageCropModal
          open={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageFile={cropImageFile}
          tileSize={cropTileSize}
          onCrop={handleCroppedImage}
          onTileSizeChange={(newSize) => {
            setCropTileSize(newSize as GalleryTileSize);
            if (cropTarget === "gallery") {
              // Also update the tile itself
              updateGalleryTile(cropTileId, { size: newSize });
            }
          }}
        />
        </>
      )}

    </div>
  );
}
