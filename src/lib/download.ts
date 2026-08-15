/**
 * Cross-browser file download that also works on mobile Safari / Android Chrome.
 *
 * Mobile browsers ignore `<a download>` for blob URLs in many cases, so we:
 * 1. Try the Web Share API with a real File (native iOS/Android save sheet).
 * 2. Fall back to an anchor that is actually attached to the DOM.
 * 3. Fall back to opening the blob URL in a new tab.
 */
export async function saveFile(data: BlobPart, filename: string, mimeType: string) {
  const file = new File([data], filename, { type: mimeType });

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
      // Otherwise fall through to the anchor download.
    }
  }

  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);

  const supportsDownload = 'download' in anchor;
  if (supportsDownload) {
    anchor.click();
  } else {
    window.open(url, '_blank');
  }

  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 10000);
}
