/**
 * Cross-browser file download that also works on mobile Safari / Android Chrome.
 *
 * Mobile browsers ignore `<a download>` for blob URLs in many cases, so we:
 * 1. Try the Web Share API with a real File (native iOS/Android save sheet).
 * 2. On mobile, open the generated file in a new tab so the browser's native
 *    viewer can save/share it (the `download` attribute is unreliable there).
 * 3. On desktop, use an attached anchor download.
 */
export async function saveFile(data: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: filename });
      return;
    } catch (err) {
      // User cancelled the share sheet - nothing else to do.
      if ((err as DOMException)?.name === 'AbortError') return;
      // Otherwise fall through to the browser-native file opening path.
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (isMobile) {
    // iOS exposes the download property but frequently ignores it for blob URLs,
    // especially inside an iframe. A normal new-tab navigation reliably opens
    // the native document viewer, where Save to Files / Share is available.
    anchor.target = '_blank';
    anchor.click();
  } else {
    anchor.download = filename;
    anchor.click();
  }

  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 60000);
}
