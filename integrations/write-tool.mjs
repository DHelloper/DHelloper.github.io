import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROUTE = "/admin/write";

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function escapeYaml(value) {
  return String(value).replace(/"/g, '\\"');
}

const FORM_HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>글쓰기 (로컬 전용)</title>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;color:#1a1a1a}
label{display:block;margin-top:16px;font-weight:600}
input,textarea{width:100%;box-sizing:border-box;padding:8px;margin-top:4px;font-family:inherit;font-size:14px}
textarea{min-height:320px;font-family:ui-monospace,monospace}
button{margin-top:20px;padding:10px 20px;font-size:15px;cursor:pointer}
#result{margin-top:16px;padding:12px;border-radius:6px;display:none;white-space:pre-wrap}
#result.ok{display:block;background:#e6f4ea;color:#1e4620}
#result.err{display:block;background:#fce8e6;color:#5f2120}
p.hint{color:#666;font-size:13px}
</style>
</head>
<body>
<h1>새 글 작성 (로컬 전용)</h1>
<p class="hint">이 페이지는 npm run dev로 실행한 로컬 서버에서만 동작하며, 프로덕션 빌드에는 포함되지 않습니다. 저장하면 src/content/posts/&lt;category-slug&gt;/&lt;slug&gt;/index.md 파일이 생성됩니다.</p>
<form id="f">
<label>제목<input name="title" required /></label>
<label>카테고리 (예: Database, Redis)<input name="category" required /></label>
<label>slug (영문 URL, 예: postgresql-index)<input name="slug" required pattern="[a-z0-9-]+" /></label>
<label>설명<input name="description" required /></label>
<label>본문 (Markdown)<textarea name="content" required></textarea></label>
<button type="submit">파일 생성</button>
</form>
<div id="result"></div>
<script>
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = {
    title: form.title.value,
    category: form.category.value,
    slug: form.slug.value,
    description: form.description.value,
    content: form.content.value,
  };
  const res = await fetch(location.pathname, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const box = document.getElementById('result');
  box.className = data.ok ? 'ok' : 'err';
  box.textContent = data.ok
    ? '생성됨: ' + data.filePath + '\\n미리보기: ' + data.url
    : '실패: ' + data.error;
});
</script>
</body>
</html>`;

export default function writeTool() {
  return {
    name: "write-tool",
    hooks: {
      "astro:server:setup": ({ server, logger }) => {
        server.middlewares.use(ROUTE, async (req, res, next) => {
          if (req.method === "GET") {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(FORM_HTML);
            return;
          }

          if (req.method === "POST") {
            try {
              const body = await readJsonBody(req);
              const { title, category, slug, description, content } = body;

              if (!title || !category || !slug || !description || !content) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "모든 필드를 입력해주세요." }));
                return;
              }

              const categorySlug = slugify(category);
              const postSlug = slugify(slug);
              const dir = path.join(process.cwd(), "src", "content", "posts", categorySlug, postSlug);
              const filePath = path.join(dir, "index.md");
              const pubDate = new Date().toISOString().slice(0, 10);

              const frontmatter = [
                "---",
                `title: "${escapeYaml(title)}"`,
                `description: "${escapeYaml(description)}"`,
                `category: "${escapeYaml(category)}"`,
                `pubDate: ${pubDate}`,
                "draft: false",
                "---",
                "",
                content,
                "",
              ].join("\n");

              await mkdir(dir, { recursive: true });
              await writeFile(filePath, frontmatter, "utf-8");

              logger.info(`새 글 생성됨: ${filePath}`);

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  ok: true,
                  filePath: path.relative(process.cwd(), filePath),
                  url: `/posts/${categorySlug}/${postSlug}`,
                })
              );
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
            return;
          }

          next();
        });
      },
    },
  };
}
