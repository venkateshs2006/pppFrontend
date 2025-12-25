// vite.config.ts
import { defineConfig } from "file:///D:/pppFrontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/pppFrontend/node_modules/@vitejs/plugin-react-swc/index.js";
import fs from "node:fs/promises";
import nodePath from "node:path";
import { componentTagger } from "file:///D:/pppFrontend/node_modules/lovable-tagger/dist/index.js";
import path from "path";
import { parse } from "file:///D:/pppFrontend/node_modules/@babel/parser/lib/index.js";
import _traverse from "file:///D:/pppFrontend/node_modules/@babel/traverse/lib/index.js";
import _generate from "file:///D:/pppFrontend/node_modules/@babel/generator/lib/index.js";
import * as t from "file:///D:/pppFrontend/node_modules/@babel/types/lib/index.js";
var __vite_injected_original_dirname = "D:\\pppFrontend";
var traverse = _traverse.default ?? _traverse;
var generate = _generate.default ?? _generate;
function cdnPrefixImages() {
  const DEBUG = process.env.CDN_IMG_DEBUG === "1";
  let publicDir = "";
  const imageSet = /* @__PURE__ */ new Set();
  const isAbsolute = (p) => /^(?:[a-z]+:)?\/\//i.test(p) || p.startsWith("data:") || p.startsWith("blob:");
  const normalizeRef = (p) => {
    let s = p.trim();
    if (isAbsolute(s)) return s;
    s = s.replace(/^(\.\/)+/, "");
    while (s.startsWith("../")) s = s.slice(3);
    if (s.startsWith("/")) s = s.slice(1);
    if (!s.startsWith("images/")) return p;
    return "/" + s;
  };
  const toCDN = (p, cdn) => {
    const n = normalizeRef(p);
    if (isAbsolute(n)) return n;
    if (!n.startsWith("/images/")) return p;
    if (!imageSet.has(n)) return p;
    const base = cdn.endsWith("/") ? cdn : cdn + "/";
    return base + n.slice(1);
  };
  const rewriteSrcsetList = (value, cdn) => value.split(",").map((part) => {
    const [url, desc] = part.trim().split(/\s+/, 2);
    const out = toCDN(url, cdn);
    return desc ? `${out} ${desc}` : out;
  }).join(", ");
  const rewriteHtml = (html, cdn) => {
    html = html.replace(
      /(src|href)\s*=\s*(['"])([^'"]+)\2/g,
      (_m, k, q, p) => `${k}=${q}${toCDN(p, cdn)}${q}`
    );
    html = html.replace(
      /(srcset)\s*=\s*(['"])([^'"]+)\2/g,
      (_m, k, q, list) => `${k}=${q}${rewriteSrcsetList(list, cdn)}${q}`
    );
    return html;
  };
  const rewriteCssUrls = (code, cdn) => code.replace(/url\((['"]?)([^'")]+)\1\)/g, (_m, q, p) => `url(${q}${toCDN(p, cdn)}${q})`);
  const rewriteJsxAst = (code, id, cdn) => {
    const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
    let rewrites = 0;
    traverse(ast, {
      JSXAttribute(path2) {
        const name = path2.node.name.name;
        const isSrc = name === "src" || name === "href";
        const isSrcSet = name === "srcSet" || name === "srcset";
        if (!isSrc && !isSrcSet) return;
        const val = path2.node.value;
        if (!val) return;
        if (t.isStringLiteral(val)) {
          const before = val.value;
          val.value = isSrc ? toCDN(val.value, cdn) : rewriteSrcsetList(val.value, cdn);
          if (val.value !== before) rewrites++;
          return;
        }
        if (t.isJSXExpressionContainer(val) && t.isStringLiteral(val.expression)) {
          const before = val.expression.value;
          val.expression.value = isSrc ? toCDN(val.expression.value, cdn) : rewriteSrcsetList(val.expression.value, cdn);
          if (val.expression.value !== before) rewrites++;
        }
      },
      StringLiteral(path2) {
        if (t.isObjectProperty(path2.parent) && path2.parentKey === "key" && !path2.parent.computed) return;
        if (t.isImportDeclaration(path2.parent) || t.isExportAllDeclaration(path2.parent) || t.isExportNamedDeclaration(path2.parent)) return;
        if (path2.findParent((p) => p.isJSXAttribute())) return;
        const before = path2.node.value;
        const after = toCDN(before, cdn);
        if (after !== before) {
          path2.node.value = after;
          rewrites++;
        }
      },
      TemplateLiteral(path2) {
        if (path2.node.expressions.length) return;
        const raw = path2.node.quasis.map((q) => q.value.cooked ?? q.value.raw).join("");
        const after = toCDN(raw, cdn);
        if (after !== raw) {
          path2.replaceWith(t.stringLiteral(after));
          rewrites++;
        }
      }
    });
    if (!rewrites) return null;
    const out = generate(ast, { retainLines: true, sourceMaps: false }, code).code;
    if (DEBUG) console.log(`[cdn] ${id} \u2192 ${rewrites} rewrites`);
    return out;
  };
  async function collectPublicImagesFrom(dir) {
    const imagesDir = nodePath.join(dir, "images");
    const stack = [imagesDir];
    while (stack.length) {
      const cur = stack.pop();
      let entries = [];
      try {
        entries = await fs.readdir(cur, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const ent of entries) {
        const full = nodePath.join(cur, ent.name);
        if (ent.isDirectory()) {
          stack.push(full);
        } else if (ent.isFile()) {
          const rel = nodePath.relative(dir, full).split(nodePath.sep).join("/");
          const canonical = "/" + rel;
          imageSet.add(canonical);
          imageSet.add(canonical.slice(1));
        }
      }
    }
  }
  return {
    name: "cdn-prefix-images-existing",
    apply: "build",
    enforce: "pre",
    // run before @vitejs/plugin-react
    configResolved(cfg) {
      publicDir = cfg.publicDir;
      if (DEBUG) console.log("[cdn] publicDir =", publicDir);
    },
    async buildStart() {
      await collectPublicImagesFrom(publicDir);
      if (DEBUG) console.log("[cdn] images found:", imageSet.size);
    },
    transformIndexHtml(html) {
      const cdn = process.env.CDN_IMG_PREFIX;
      if (!cdn) return html;
      const out = rewriteHtml(html, cdn);
      if (DEBUG) console.log("[cdn] transformIndexHtml done");
      return out;
    },
    transform(code, id) {
      const cdn = process.env.CDN_IMG_PREFIX;
      if (!cdn) return null;
      if (/\.(jsx|tsx)$/.test(id)) {
        const out = rewriteJsxAst(code, id, cdn);
        return out ? { code: out, map: null } : null;
      }
      if (/\.(css|scss|sass|less|styl)$/i.test(id)) {
        const out = rewriteCssUrls(code, cdn);
        return out === code ? null : { code: out, map: null };
      }
      return null;
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      cdnPrefixImages()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        // Proxy react-router-dom to our wrapper
        "react-router-dom": path.resolve(__vite_injected_original_dirname, "./src/lib/react-router-dom-proxy.tsx"),
        // Original react-router-dom under a different name
        "react-router-dom-original": "react-router-dom"
      }
    },
    define: {
      // Define environment variables for build-time configuration
      // In production, this will be false by default unless explicitly set to 'true'
      // In development and test, this will be true by default
      __ROUTE_MESSAGING_ENABLED__: JSON.stringify(
        mode === "production" ? process.env.VITE_ENABLE_ROUTE_MESSAGING === "true" : process.env.VITE_ENABLE_ROUTE_MESSAGING !== "false"
      )
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxwcHBGcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxccHBwRnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3BwcEZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Ly8gdml0ZS5jb25maWcudHNcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcclxuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xyXG5pbXBvcnQgbm9kZVBhdGggZnJvbSAnbm9kZTpwYXRoJztcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSAnbG92YWJsZS10YWdnZXInO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICdAYmFiZWwvcGFyc2VyJztcclxuaW1wb3J0IF90cmF2ZXJzZSBmcm9tICdAYmFiZWwvdHJhdmVyc2UnO1xyXG5pbXBvcnQgX2dlbmVyYXRlIGZyb20gJ0BiYWJlbC9nZW5lcmF0b3InO1xyXG5pbXBvcnQgKiBhcyB0IGZyb20gJ0BiYWJlbC90eXBlcyc7XHJcblxyXG5cclxuLy8gQ0pTL0VTTSBpbnRlcm9wIGZvciBCYWJlbCBsaWJzXHJcbmNvbnN0IHRyYXZlcnNlOiB0eXBlb2YgX3RyYXZlcnNlLmRlZmF1bHQgPSAoIChfdHJhdmVyc2UgYXMgYW55KS5kZWZhdWx0ID8/IF90cmF2ZXJzZSApIGFzIGFueTtcclxuY29uc3QgZ2VuZXJhdGU6IHR5cGVvZiBfZ2VuZXJhdGUuZGVmYXVsdCA9ICggKF9nZW5lcmF0ZSBhcyBhbnkpLmRlZmF1bHQgPz8gX2dlbmVyYXRlICkgYXMgYW55O1xyXG5cclxuZnVuY3Rpb24gY2RuUHJlZml4SW1hZ2VzKCk6IFBsdWdpbiB7XHJcbiAgY29uc3QgREVCVUcgPSBwcm9jZXNzLmVudi5DRE5fSU1HX0RFQlVHID09PSAnMSc7XHJcbiAgbGV0IHB1YmxpY0RpciA9ICcnOyAgICAgICAgICAgICAgLy8gYWJzb2x1dGUgcGF0aCB0byBWaXRlIHB1YmxpYyBkaXJcclxuICBjb25zdCBpbWFnZVNldCA9IG5ldyBTZXQ8c3RyaW5nPigpOyAvLyBzdG9yZXMgbm9ybWFsaXplZCAnL2ltYWdlcy8uLi4nIHBhdGhzXHJcblxyXG4gIGNvbnN0IGlzQWJzb2x1dGUgPSAocDogc3RyaW5nKSA9PlxyXG4gICAgL14oPzpbYS16XSs6KT9cXC9cXC8vaS50ZXN0KHApIHx8IHAuc3RhcnRzV2l0aCgnZGF0YTonKSB8fCBwLnN0YXJ0c1dpdGgoJ2Jsb2I6Jyk7XHJcblxyXG4gIC8vIG5vcm1hbGl6ZSBhIHJlZiBsaWtlICcuL2ltYWdlcy94LnBuZycsICcuLi9pbWFnZXMveC5wbmcnLCAnL2ltYWdlcy94LnBuZycgLT4gJy9pbWFnZXMveC5wbmcnXHJcbiAgY29uc3Qgbm9ybWFsaXplUmVmID0gKHA6IHN0cmluZykgPT4ge1xyXG4gICAgbGV0IHMgPSBwLnRyaW0oKTtcclxuICAgIC8vIHF1aWNrIGJhaWwtb3V0c1xyXG4gICAgaWYgKGlzQWJzb2x1dGUocykpIHJldHVybiBzO1xyXG4gICAgLy8gc3RyaXAgbGVhZGluZyAuLyBhbmQgYW55IC4uLyBzZWdtZW50cyAod2UgdHJlYXQgcHVibGljLyBhcyByb290IGF0IHJ1bnRpbWUpXHJcbiAgICBzID0gcy5yZXBsYWNlKC9eKFxcLlxcLykrLywgJycpO1xyXG4gICAgd2hpbGUgKHMuc3RhcnRzV2l0aCgnLi4vJykpIHMgPSBzLnNsaWNlKDMpO1xyXG4gICAgaWYgKHMuc3RhcnRzV2l0aCgnLycpKSBzID0gcy5zbGljZSgxKTtcclxuICAgIC8vIGVuc3VyZSBpdCBzdGFydHMgd2l0aCBpbWFnZXMvXHJcbiAgICBpZiAoIXMuc3RhcnRzV2l0aCgnaW1hZ2VzLycpKSByZXR1cm4gcDsgLy8gbm90IHVuZGVyIGltYWdlcyBcdTIxOTIgbGVhdmUgYXMgaXNcclxuICAgIHJldHVybiAnLycgKyBzOyAvLyBjYW5vbmljYWw6ICcvaW1hZ2VzLy4uLidcclxuICB9O1xyXG5cclxuICBjb25zdCB0b0NETiA9IChwOiBzdHJpbmcsIGNkbjogc3RyaW5nKSA9PiB7XHJcbiAgICBjb25zdCBuID0gbm9ybWFsaXplUmVmKHApO1xyXG4gICAgaWYgKGlzQWJzb2x1dGUobikpIHJldHVybiBuO1xyXG4gICAgaWYgKCFuLnN0YXJ0c1dpdGgoJy9pbWFnZXMvJykpIHJldHVybiBwOyAgICAgICAgICAgLy8gbm90IG91ciBmb2xkZXJcclxuICAgIGlmICghaW1hZ2VTZXQuaGFzKG4pKSByZXR1cm4gcDsgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBhbiBleGlzdGluZyBmaWxlXHJcbiAgICBjb25zdCBiYXNlID0gY2RuLmVuZHNXaXRoKCcvJykgPyBjZG4gOiBjZG4gKyAnLyc7XHJcbiAgICByZXR1cm4gYmFzZSArIG4uc2xpY2UoMSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAnaHR0cHM6Ly9jZG4vLi4uL2ltYWdlcy8uLidcclxuICB9O1xyXG5cclxuICBjb25zdCByZXdyaXRlU3Jjc2V0TGlzdCA9ICh2YWx1ZTogc3RyaW5nLCBjZG46IHN0cmluZykgPT5cclxuICAgIHZhbHVlXHJcbiAgICAgIC5zcGxpdCgnLCcpXHJcbiAgICAgIC5tYXAoKHBhcnQpID0+IHtcclxuICAgICAgICBjb25zdCBbdXJsLCBkZXNjXSA9IHBhcnQudHJpbSgpLnNwbGl0KC9cXHMrLywgMik7XHJcbiAgICAgICAgY29uc3Qgb3V0ID0gdG9DRE4odXJsLCBjZG4pO1xyXG4gICAgICAgIHJldHVybiBkZXNjID8gYCR7b3V0fSAke2Rlc2N9YCA6IG91dDtcclxuICAgICAgfSlcclxuICAgICAgLmpvaW4oJywgJyk7XHJcblxyXG4gIGNvbnN0IHJld3JpdGVIdG1sID0gKGh0bWw6IHN0cmluZywgY2RuOiBzdHJpbmcpID0+IHtcclxuICAgIC8vIHNyYyAvIGhyZWZcclxuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXHJcbiAgICAgIC8oc3JjfGhyZWYpXFxzKj1cXHMqKFsnXCJdKShbXidcIl0rKVxcMi9nLFxyXG4gICAgICAoX20sIGssIHEsIHApID0+IGAke2t9PSR7cX0ke3RvQ0ROKHAsIGNkbil9JHtxfWBcclxuICAgICk7XHJcbiAgICAvLyBzcmNzZXRcclxuICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXHJcbiAgICAgIC8oc3Jjc2V0KVxccyo9XFxzKihbJ1wiXSkoW14nXCJdKylcXDIvZyxcclxuICAgICAgKF9tLCBrLCBxLCBsaXN0KSA9PiBgJHtrfT0ke3F9JHtyZXdyaXRlU3Jjc2V0TGlzdChsaXN0LCBjZG4pfSR7cX1gXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGh0bWw7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcmV3cml0ZUNzc1VybHMgPSAoY29kZTogc3RyaW5nLCBjZG46IHN0cmluZykgPT5cclxuICAgIGNvZGUucmVwbGFjZSgvdXJsXFwoKFsnXCJdPykoW14nXCIpXSspXFwxXFwpL2csIChfbSwgcSwgcCkgPT4gYHVybCgke3F9JHt0b0NETihwLCBjZG4pfSR7cX0pYCk7XHJcblxyXG4gIGNvbnN0IHJld3JpdGVKc3hBc3QgPSAoY29kZTogc3RyaW5nLCBpZDogc3RyaW5nLCBjZG46IHN0cmluZykgPT4ge1xyXG4gICAgY29uc3QgYXN0ID0gcGFyc2UoY29kZSwgeyBzb3VyY2VUeXBlOiAnbW9kdWxlJywgcGx1Z2luczogWyd0eXBlc2NyaXB0JywgJ2pzeCddIH0pO1xyXG4gICAgbGV0IHJld3JpdGVzID0gMDtcclxuXHJcbiAgICB0cmF2ZXJzZShhc3QsIHtcclxuICAgICAgSlNYQXR0cmlidXRlKHBhdGgpIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gKHBhdGgubm9kZS5uYW1lIGFzIHQuSlNYSWRlbnRpZmllcikubmFtZTtcclxuICAgICAgICBjb25zdCBpc1NyYyA9IG5hbWUgPT09ICdzcmMnIHx8IG5hbWUgPT09ICdocmVmJztcclxuICAgICAgICBjb25zdCBpc1NyY1NldCA9IG5hbWUgPT09ICdzcmNTZXQnIHx8IG5hbWUgPT09ICdzcmNzZXQnO1xyXG4gICAgICAgIGlmICghaXNTcmMgJiYgIWlzU3JjU2V0KSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHZhbCA9IHBhdGgubm9kZS52YWx1ZTtcclxuICAgICAgICBpZiAoIXZhbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAodC5pc1N0cmluZ0xpdGVyYWwodmFsKSkge1xyXG4gICAgICAgICAgY29uc3QgYmVmb3JlID0gdmFsLnZhbHVlO1xyXG4gICAgICAgICAgdmFsLnZhbHVlID0gaXNTcmMgPyB0b0NETih2YWwudmFsdWUsIGNkbikgOiByZXdyaXRlU3Jjc2V0TGlzdCh2YWwudmFsdWUsIGNkbik7XHJcbiAgICAgICAgICBpZiAodmFsLnZhbHVlICE9PSBiZWZvcmUpIHJld3JpdGVzKys7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0LmlzSlNYRXhwcmVzc2lvbkNvbnRhaW5lcih2YWwpICYmIHQuaXNTdHJpbmdMaXRlcmFsKHZhbC5leHByZXNzaW9uKSkge1xyXG4gICAgICAgICAgY29uc3QgYmVmb3JlID0gdmFsLmV4cHJlc3Npb24udmFsdWU7XHJcbiAgICAgICAgICB2YWwuZXhwcmVzc2lvbi52YWx1ZSA9IGlzU3JjXHJcbiAgICAgICAgICAgID8gdG9DRE4odmFsLmV4cHJlc3Npb24udmFsdWUsIGNkbilcclxuICAgICAgICAgICAgOiByZXdyaXRlU3Jjc2V0TGlzdCh2YWwuZXhwcmVzc2lvbi52YWx1ZSwgY2RuKTtcclxuICAgICAgICAgIGlmICh2YWwuZXhwcmVzc2lvbi52YWx1ZSAhPT0gYmVmb3JlKSByZXdyaXRlcysrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIFN0cmluZ0xpdGVyYWwocGF0aCkge1xyXG4gICAgICAgIC8vIHNraXAgb2JqZWN0IGtleXM6IHsgXCJpbWFnZVwiOiBcIi4uLlwiIH1cclxuICAgICAgICBpZiAodC5pc09iamVjdFByb3BlcnR5KHBhdGgucGFyZW50KSAmJiBwYXRoLnBhcmVudEtleSA9PT0gJ2tleScgJiYgIXBhdGgucGFyZW50LmNvbXB1dGVkKSByZXR1cm47XHJcbiAgICAgICAgLy8gc2tpcCBpbXBvcnQvZXhwb3J0IHNvdXJjZXNcclxuICAgICAgICBpZiAodC5pc0ltcG9ydERlY2xhcmF0aW9uKHBhdGgucGFyZW50KSB8fCB0LmlzRXhwb3J0QWxsRGVjbGFyYXRpb24ocGF0aC5wYXJlbnQpIHx8IHQuaXNFeHBvcnROYW1lZERlY2xhcmF0aW9uKHBhdGgucGFyZW50KSkgcmV0dXJuO1xyXG4gICAgICAgIC8vIHNraXAgaW5zaWRlIEpTWCBhdHRyaWJ1dGUgKGFscmVhZHkgaGFuZGxlZClcclxuICAgICAgICBpZiAocGF0aC5maW5kUGFyZW50KHAgPT4gcC5pc0pTWEF0dHJpYnV0ZSgpKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBiZWZvcmUgPSBwYXRoLm5vZGUudmFsdWU7XHJcbiAgICAgICAgY29uc3QgYWZ0ZXIgPSB0b0NETihiZWZvcmUsIGNkbik7XHJcbiAgICAgICAgaWYgKGFmdGVyICE9PSBiZWZvcmUpIHsgcGF0aC5ub2RlLnZhbHVlID0gYWZ0ZXI7IHJld3JpdGVzKys7IH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIFRlbXBsYXRlTGl0ZXJhbChwYXRoKSB7XHJcbiAgICAgICAgLy8gaGFuZGxlIGBcIi9pbWFnZXMvZm9vLnBuZ1wiYCBhcyB0ZW1wbGF0ZSB3aXRoIE5PIGV4cHJlc3Npb25zXHJcbiAgICAgICAgaWYgKHBhdGgubm9kZS5leHByZXNzaW9ucy5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICBjb25zdCByYXcgPSBwYXRoLm5vZGUucXVhc2lzLm1hcChxID0+IHEudmFsdWUuY29va2VkID8/IHEudmFsdWUucmF3KS5qb2luKCcnKTtcclxuICAgICAgICBjb25zdCBhZnRlciA9IHRvQ0ROKHJhdywgY2RuKTtcclxuICAgICAgICBpZiAoYWZ0ZXIgIT09IHJhdykge1xyXG4gICAgICAgICAgcGF0aC5yZXBsYWNlV2l0aCh0LnN0cmluZ0xpdGVyYWwoYWZ0ZXIpKTtcclxuICAgICAgICAgIHJld3JpdGVzKys7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghcmV3cml0ZXMpIHJldHVybiBudWxsO1xyXG4gICAgY29uc3Qgb3V0ID0gZ2VuZXJhdGUoYXN0LCB7IHJldGFpbkxpbmVzOiB0cnVlLCBzb3VyY2VNYXBzOiBmYWxzZSB9LCBjb2RlKS5jb2RlO1xyXG4gICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZyhgW2Nkbl0gJHtpZH0gXHUyMTkyICR7cmV3cml0ZXN9IHJld3JpdGVzYCk7XHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH07XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RQdWJsaWNJbWFnZXNGcm9tKGRpcjogc3RyaW5nKSB7XHJcbiAgICAvLyBSZWN1cnNpdmVseSBjb2xsZWN0IGV2ZXJ5IGZpbGUgdW5kZXIgcHVibGljL2ltYWdlcyBpbnRvIGltYWdlU2V0IGFzICcvaW1hZ2VzL3JlbHBhdGgnXHJcbiAgICBjb25zdCBpbWFnZXNEaXIgPSBub2RlUGF0aC5qb2luKGRpciwgJ2ltYWdlcycpO1xyXG4gICAgY29uc3Qgc3RhY2sgPSBbaW1hZ2VzRGlyXTtcclxuICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcclxuICAgICAgY29uc3QgY3VyID0gc3RhY2sucG9wKCkhO1xyXG4gICAgICBsZXQgZW50cmllczogYW55W10gPSBbXTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlbnRyaWVzID0gYXdhaXQgZnMucmVhZGRpcihjdXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgY29udGludWU7IC8vIGltYWdlcy8gbWF5IG5vdCBleGlzdFxyXG4gICAgICB9XHJcbiAgICAgIGZvciAoY29uc3QgZW50IG9mIGVudHJpZXMpIHtcclxuICAgICAgICBjb25zdCBmdWxsID0gbm9kZVBhdGguam9pbihjdXIsIGVudC5uYW1lKTtcclxuICAgICAgICBpZiAoZW50LmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgIHN0YWNrLnB1c2goZnVsbCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlbnQuaXNGaWxlKCkpIHtcclxuICAgICAgICAgIGNvbnN0IHJlbCA9IG5vZGVQYXRoLnJlbGF0aXZlKGRpciwgZnVsbCkuc3BsaXQobm9kZVBhdGguc2VwKS5qb2luKCcvJyk7XHJcbiAgICAgICAgICBjb25zdCBjYW5vbmljYWwgPSAnLycgKyByZWw7IC8vICcvaW1hZ2VzLy4uLidcclxuICAgICAgICAgIGltYWdlU2V0LmFkZChjYW5vbmljYWwpO1xyXG4gICAgICAgICAgLy8gYWxzbyBhZGQgdmFyaWFudCB3aXRob3V0IGxlYWRpbmcgc2xhc2ggZm9yIHNhZmV0eVxyXG4gICAgICAgICAgaW1hZ2VTZXQuYWRkKGNhbm9uaWNhbC5zbGljZSgxKSk7IC8vICdpbWFnZXMvLi4uJ1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdjZG4tcHJlZml4LWltYWdlcy1leGlzdGluZycsXHJcbiAgICBhcHBseTogJ2J1aWxkJyxcclxuICAgIGVuZm9yY2U6ICdwcmUnLCAvLyBydW4gYmVmb3JlIEB2aXRlanMvcGx1Z2luLXJlYWN0XHJcblxyXG4gICAgY29uZmlnUmVzb2x2ZWQoY2ZnKSB7XHJcbiAgICAgIHB1YmxpY0RpciA9IGNmZy5wdWJsaWNEaXI7IC8vIGFic29sdXRlXHJcbiAgICAgIGlmIChERUJVRykgY29uc29sZS5sb2coJ1tjZG5dIHB1YmxpY0RpciA9JywgcHVibGljRGlyKTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgYnVpbGRTdGFydCgpIHtcclxuICAgICAgYXdhaXQgY29sbGVjdFB1YmxpY0ltYWdlc0Zyb20ocHVibGljRGlyKTtcclxuICAgICAgaWYgKERFQlVHKSBjb25zb2xlLmxvZygnW2Nkbl0gaW1hZ2VzIGZvdW5kOicsIGltYWdlU2V0LnNpemUpO1xyXG4gICAgfSxcclxuXHJcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xyXG4gICAgICBjb25zdCBjZG4gPSBwcm9jZXNzLmVudi5DRE5fSU1HX1BSRUZJWDtcclxuICAgICAgaWYgKCFjZG4pIHJldHVybiBodG1sO1xyXG4gICAgICBjb25zdCBvdXQgPSByZXdyaXRlSHRtbChodG1sLCBjZG4pO1xyXG4gICAgICBpZiAoREVCVUcpIGNvbnNvbGUubG9nKCdbY2RuXSB0cmFuc2Zvcm1JbmRleEh0bWwgZG9uZScpO1xyXG4gICAgICByZXR1cm4gb3V0O1xyXG4gICAgfSxcclxuXHJcbiAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcclxuICAgICAgY29uc3QgY2RuID0gcHJvY2Vzcy5lbnYuQ0ROX0lNR19QUkVGSVg7XHJcbiAgICAgIGlmICghY2RuKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgIGlmICgvXFwuKGpzeHx0c3gpJC8udGVzdChpZCkpIHtcclxuICAgICAgICBjb25zdCBvdXQgPSByZXdyaXRlSnN4QXN0KGNvZGUsIGlkLCBjZG4pO1xyXG4gICAgICAgIHJldHVybiBvdXQgPyB7IGNvZGU6IG91dCwgbWFwOiBudWxsIH0gOiBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoL1xcLihjc3N8c2Nzc3xzYXNzfGxlc3N8c3R5bCkkL2kudGVzdChpZCkpIHtcclxuICAgICAgICBjb25zdCBvdXQgPSByZXdyaXRlQ3NzVXJscyhjb2RlLCBjZG4pO1xyXG4gICAgICAgIHJldHVybiBvdXQgPT09IGNvZGUgPyBudWxsIDogeyBjb2RlOiBvdXQsIG1hcDogbnVsbCB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgaG9zdDogXCI6OlwiLFxyXG4gICAgICBwb3J0OiA4MDgwLFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSxcclxuICAgICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxyXG4gICAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICAgICAgY2RuUHJlZml4SW1hZ2VzKCksXHJcbiAgICBdLmZpbHRlcihCb29sZWFuKSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgICAvLyBQcm94eSByZWFjdC1yb3V0ZXItZG9tIHRvIG91ciB3cmFwcGVyXHJcbiAgICAgICAgXCJyZWFjdC1yb3V0ZXItZG9tXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvbGliL3JlYWN0LXJvdXRlci1kb20tcHJveHkudHN4XCIpLFxyXG4gICAgICAgIC8vIE9yaWdpbmFsIHJlYWN0LXJvdXRlci1kb20gdW5kZXIgYSBkaWZmZXJlbnQgbmFtZVxyXG4gICAgICAgIFwicmVhY3Qtcm91dGVyLWRvbS1vcmlnaW5hbFwiOiBcInJlYWN0LXJvdXRlci1kb21cIixcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgLy8gRGVmaW5lIGVudmlyb25tZW50IHZhcmlhYmxlcyBmb3IgYnVpbGQtdGltZSBjb25maWd1cmF0aW9uXHJcbiAgICAgIC8vIEluIHByb2R1Y3Rpb24sIHRoaXMgd2lsbCBiZSBmYWxzZSBieSBkZWZhdWx0IHVubGVzcyBleHBsaWNpdGx5IHNldCB0byAndHJ1ZSdcclxuICAgICAgLy8gSW4gZGV2ZWxvcG1lbnQgYW5kIHRlc3QsIHRoaXMgd2lsbCBiZSB0cnVlIGJ5IGRlZmF1bHRcclxuICAgICAgX19ST1VURV9NRVNTQUdJTkdfRU5BQkxFRF9fOiBKU09OLnN0cmluZ2lmeShcclxuICAgICAgICBtb2RlID09PSAncHJvZHVjdGlvbicgXHJcbiAgICAgICAgICA/IHByb2Nlc3MuZW52LlZJVEVfRU5BQkxFX1JPVVRFX01FU1NBR0lORyA9PT0gJ3RydWUnXHJcbiAgICAgICAgICA6IHByb2Nlc3MuZW52LlZJVEVfRU5BQkxFX1JPVVRFX01FU1NBR0lORyAhPT0gJ2ZhbHNlJ1xyXG4gICAgICApLFxyXG4gICAgfSxcclxuICB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBaUM7QUFDMUMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sUUFBUTtBQUNmLE9BQU8sY0FBYztBQUNyQixTQUFTLHVCQUF1QjtBQUNoQyxPQUFPLFVBQVU7QUFFakIsU0FBUyxhQUFhO0FBQ3RCLE9BQU8sZUFBZTtBQUN0QixPQUFPLGVBQWU7QUFDdEIsWUFBWSxPQUFPO0FBWG5CLElBQU0sbUNBQW1DO0FBZXpDLElBQU0sV0FBd0MsVUFBa0IsV0FBVztBQUMzRSxJQUFNLFdBQXdDLFVBQWtCLFdBQVc7QUFFM0UsU0FBUyxrQkFBMEI7QUFDakMsUUFBTSxRQUFRLFFBQVEsSUFBSSxrQkFBa0I7QUFDNUMsTUFBSSxZQUFZO0FBQ2hCLFFBQU0sV0FBVyxvQkFBSSxJQUFZO0FBRWpDLFFBQU0sYUFBYSxDQUFDLE1BQ2xCLHFCQUFxQixLQUFLLENBQUMsS0FBSyxFQUFFLFdBQVcsT0FBTyxLQUFLLEVBQUUsV0FBVyxPQUFPO0FBRy9FLFFBQU0sZUFB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
