const baseUrl = "https://emade.social";
const password = "slingshot-admin";
const results = [];

const summarize = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value.summary) return value.summary;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const step = async (name, fn) => {
  try {
    const result = await fn();
    const summary = summarize(result);
    console.log(`[OK] ${name} :: ${summary}`);
    results.push({ name, ok: true, summary });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[FAIL] ${name} :: ${message}`);
    results.push({ name, ok: false, summary: message });
    return null;
  }
};

const jsonFromResponse = async (res) => {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const run = async () => {
  // Login first to obtain session cookie
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    redirect: "manual",
  });
  const loginData = await jsonFromResponse(loginRes);
  if (!loginRes.headers.has("set-cookie")) {
    throw new Error("Missing admin session cookie");
  }
  const rawCookie = loginRes.headers.get("set-cookie");
  const sessionCookie = rawCookie.split(",")[0].split(";")[0].trim();
  console.log(`[INFO] Logged in, cookie: ${sessionCookie}`);

  const fetchWithCookie = (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    headers.set("Cookie", sessionCookie);
    const body = options.body;
    const isFormData = body instanceof FormData;
    if (!isFormData && body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });
  };

  const fetchJson = async (path, options = {}) => {
    const res = await fetchWithCookie(path, options);
    return jsonFromResponse(res);
  };

  await step("admin/me", async () => {
    const data = await fetchJson("/api/admin/me");
    return { summary: `authed=${Boolean(data?.ok ?? data?.authenticated ?? false)}` };
  });

  await step("config-status", async () => {
    const data = await fetchJson("/api/config-status");
    return {
      summary: `blob=${data.hasBlobStorage} db=${data.hasDatabase} gemini=${data.hasGeminiApi}`,
    };
  });

  const siteOriginal = await step("site/get", async () => {
    const data = await fetchJson("/api/site");
    return {
      summary: `stats=${data.stats?.length ?? 0} team=${data.teamMembers?.length ?? 0}`,
      data,
    };
  });

  if (siteOriginal?.data) {
    await step("site/post", async () => {
      const timestamp = new Date().toISOString();
      const mutated = {
        ...siteOriginal.data,
        heroMessage: `${siteOriginal.data.heroMessage} [auto-check ${timestamp}]`,
      };
      try {
        await fetchJson("/api/site", {
          method: "POST",
          body: JSON.stringify(mutated),
        });
        const confirm = await fetchJson("/api/site");
        const changed = String(confirm.heroMessage || "").includes(timestamp);
        return { summary: `updated=${changed}` };
      } finally {
        await fetchJson("/api/site", {
          method: "POST",
          body: JSON.stringify(siteOriginal.data),
        });
      }
    });
  }

  const storiesOriginal = await step("stories/get", async () => {
    const data = await fetchJson("/api/stories");
    return {
      summary: `stories=${Array.isArray(data) ? data.length : 0}`,
      data,
    };
  });

  if (storiesOriginal?.data && Array.isArray(storiesOriginal.data)) {
    await step("stories/post", async () => {
      const testStory = {
        slug: `automation-check-${Date.now()}`,
        title: "Automation Check Story",
        excerpt: "Verification story for admin panel automation.",
        body: "Paragraph one.\n\nParagraph two.\n\nParagraph three.",
        author: "Admin Bot",
        category: "Testing",
        time: "4 min read",
        status: "draft",
        imageUrl: "",
        tags: ["automation", "test"],
      };
      const mutated = [testStory, ...storiesOriginal.data];
      try {
        await fetchJson("/api/stories", {
          method: "POST",
          body: JSON.stringify(mutated),
        });
        const confirm = await fetchJson("/api/stories");
        const inserted = Array.isArray(confirm)
          ? confirm.some((story) => story.slug === testStory.slug)
          : false;
        return { summary: `inserted=${inserted}` };
      } finally {
        await fetchJson("/api/stories", {
          method: "POST",
          body: JSON.stringify(storiesOriginal.data),
        });
      }
    });
  }

  const diyOriginal = await step("diy/get", async () => {
    const data = await fetchJson("/api/diy");
    return {
      summary: `projects=${Array.isArray(data) ? data.length : 0}`,
      data,
    };
  });

  if (diyOriginal?.data && Array.isArray(diyOriginal.data)) {
    await step("diy/post", async () => {
      const testProject = {
        name: `Automation Check Project ${Date.now()}`,
        difficulty: "Starter",
        time: "30 min",
        outcome: "Ensures admin DIY save works.",
        steps: ["Step one", "Step two"],
        materials: ["Test item"],
        safetyTips: ["Wear gloves"],
        imageUrl: "",
        pdfUrl: "",
      };
      const mutated = [testProject, ...diyOriginal.data];
      try {
        await fetchJson("/api/diy", {
          method: "POST",
          body: JSON.stringify(mutated),
        });
        const confirm = await fetchJson("/api/diy");
        const inserted = Array.isArray(confirm)
          ? confirm.some((project) => project.name === testProject.name)
          : false;
        return { summary: `inserted=${inserted}` };
      } finally {
        await fetchJson("/api/diy", {
          method: "POST",
          body: JSON.stringify(diyOriginal.data),
        });
      }
    });
  }

  await step("analytics/get", async () => {
    const data = await fetchJson("/api/analytics");
    return {
      summary: `stories=${data.totalStories} chats=${data.totalChats} diy=${data.totalDiyProjects}`,
    };
  });

  const firstStorySlug = Array.isArray(storiesOriginal?.data) && storiesOriginal.data.length > 0
    ? storiesOriginal.data[0].slug
    : null;

  await step("chats/list", async () => {
    const data = await fetchJson("/api/chats");
    const totalThreads = data && typeof data === "object" ? Object.keys(data).length : 0;
    return { summary: `threads=${totalThreads}` };
  });

  if (firstStorySlug) {
    await step("chats/story", async () => {
      const data = await fetchJson(`/api/chats?storySlug=${firstStorySlug}`);
      const count = Array.isArray(data) ? data.length : 0;
      return { summary: `${firstStorySlug} messages=${count}` };
    });
  }

  let chatMessageId = null;
  await step("chats/post", async () => {
    const payload = {
      storySlug: "automation-check",
      name: "Automation",
      message: "Admin automation test message.",
    };
    const data = await fetchJson("/api/chats", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    chatMessageId = data?.id;
    return { summary: `stored=${Boolean(chatMessageId)} via=${data?.storage}` };
  });

  if (chatMessageId) {
    await step("chats/react", async () => {
      const data = await fetchJson("/api/chats", {
        method: "PATCH",
        body: JSON.stringify({
          storySlug: "automation-check",
          messageId: chatMessageId,
          reaction: "support",
        }),
      });
      return {
        summary: `reactions=${JSON.stringify(data?.reactions ?? {})}`,
      };
    });
  }

  await step("admin/page", async () => {
    const res = await fetchWithCookie("/admin");
    if (!res.ok) throw new Error(`status ${res.status}`);
    return { summary: `status=${res.status}` };
  });

  await step("admin/preview", async () => {
    const res = await fetchWithCookie("/admin/preview");
    if (!res.ok) throw new Error(`status ${res.status}`);
    return { summary: `status=${res.status}` };
  });

  await step("gemini/hero", async () => {
    const data = await fetchJson("/api/gemini/generate-hero", { method: "POST" });
    return { summary: `message=${String(data.heroMessage || "").slice(0, 48)}` };
  });

  await step("gemini/stats", async () => {
    const data = await fetchJson("/api/gemini/generate-stats", { method: "POST" });
    return { summary: `stats=${data?.stats?.length ?? 0}` };
  });

  const storyGen = await step("gemini/story", async () => {
    const data = await fetchJson("/api/gemini/generate-story", { method: "POST" });
    const title = data?.story?.title ?? "";
    return { summary: `title=${String(title).slice(0, 32)}`, data };
  });

  const diyGen = await step("gemini/diy", async () => {
    const data = await fetchJson("/api/gemini/generate-diy", { method: "POST" });
    const name = data?.project?.name ?? "";
    return { summary: `project=${String(name).slice(0, 32)}`, data };
  });

  if (storyGen?.data?.story) {
    await step("gemini/story-pdf", async () => {
      const data = await fetchJson("/api/gemini/generate-pdf", {
        method: "POST",
        body: JSON.stringify({ story: storyGen.data.story }),
      });
      return { summary: `storage=${data?.storage ?? "inline"}` };
    });
  }

  if (diyGen?.data?.project) {
    await step("gemini/diy-pdf", async () => {
      const data = await fetchJson("/api/gemini/generate-diy-pdf", {
        method: "POST",
        body: JSON.stringify({ project: diyGen.data.project }),
      });
      return { summary: `storage=${data?.storage ?? "inline"}` };
    });
  }

  await step("gemini/moderate", async () => {
    const data = await fetchJson("/api/gemini/moderate", {
      method: "POST",
      body: JSON.stringify({ text: "Please recycle old phones safely." }),
    });
    return { summary: `allowed=${data?.allowed}` };
  });

  await step("gemini/moderate-chat", async () => {
    const data = await fetchJson("/api/gemini/moderate-chat", {
      method: "POST",
      body: JSON.stringify({
        name: "Automation",
        message: "How do we host a community battery recycling drive?",
      }),
    });
    return { summary: `category=${data?.category}` };
  });

  await step("gemini/topics", async () => {
    const data = await fetchJson("/api/gemini/suggest-topics", { method: "POST" });
    return { summary: `suggestions=${data?.suggestions?.length ?? 0}` };
  });

  await step("upload/image", async () => {
    const form = new FormData();
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCJljYAAAAAIAAeIhvDMAAAAASUVORK5CYII=",
      "base64"
    );
    const file = new File([pngBuffer], `admin-check-${Date.now()}.png`, {
      type: "image/png",
    });
    form.append("file", file);
    const res = await fetchWithCookie("/api/upload/image", {
      method: "POST",
      body: form,
    });
    const data = await jsonFromResponse(res);
    return { summary: `storage=${data?.storage} url=${String(data?.url || "").slice(0, 60)}` };
  });

  await step("upload/pdf", async () => {
    const form = new FormData();
    const pdfBuffer = Buffer.from(
      "JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmogICUgQ3JlYXRlZCBieSBBZG1pbiBBdXRvIFRlc3QKZW5kb2JqCnhyZWYKMSAwCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgMwpSb290IDEgMCBSCj4+CnN0YXJ0eHJlZgowCjUlRU9G",
      "base64"
    );
    const file = new File([pdfBuffer], `admin-check-${Date.now()}.pdf`, {
      type: "application/pdf",
    });
    form.append("file", file);
    const res = await fetchWithCookie("/api/upload/pdf", {
      method: "POST",
      body: form,
    });
    const data = await jsonFromResponse(res);
    return { summary: `storage=${data?.storage} url=${String(data?.url || "").slice(0, 60)}` };
  });

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.length - successCount;
  console.log(`\nCompleted ${results.length} checks :: ${successCount} ok, ${failCount} failed.`);
};

run().catch((error) => {
  console.error("Fatal error", error);
  process.exitCode = 1;
});
