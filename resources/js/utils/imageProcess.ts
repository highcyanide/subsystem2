// Image Processing & Dark Mode Transparency Optimization Utilities

const imageCache = new Map<string, string>();

/**
 * Removes solid or near-white backgrounds from product images using boundary flood fill.
 * Only outer white pixels connected to the borders are made transparent.
 * White packaging, text, logos, or milk graphics inside the product are fully preserved.
 */
export function removeWhiteBackgroundFromImage(
    img: HTMLImageElement,
    tolerance = 28
): string {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return img.src;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return img.src;

    ctx.drawImage(img, 0, 0, w, h);
    let imageData: ImageData;
    try {
        imageData = ctx.getImageData(0, 0, w, h);
    } catch {
        // Cross-origin restriction fallback
        return img.src;
    }

    const data = imageData.data;

    // Check if pixel is white or near-white background
    const isWhite = (i: number): boolean => {
        const a = data[i + 3];
        if (a < 25) return false; // already transparent
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const threshold = 255 - tolerance;
        return r >= threshold && g >= threshold && b >= threshold;
    };

    // Check corners to verify if this image even has a white background
    // Check if any border pixel has white/near-white background
    let hasWhiteBorder = false;
    for (let x = 0; x < w; x += 5) {
        if (isWhite(x * 4) || isWhite(((h - 1) * w + x) * 4)) {
            hasWhiteBorder = true;
            break;
        }
    }
    if (!hasWhiteBorder) {
        for (let y = 0; y < h; y += 5) {
            if (isWhite((y * w) * 4) || isWhite((y * w + (w - 1)) * 4)) {
                hasWhiteBorder = true;
                break;
            }
        }
    }
    if (!hasWhiteBorder) {
        return img.src;
    }

    // Boundary Flood Fill (BFS) starting strictly from the outer border
    const totalPixels = w * h;
    const visited = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    // Seed top and bottom borders
    for (let x = 0; x < w; x++) {
        const pTop = x;
        if (isWhite(pTop * 4) && !visited[pTop]) {
            visited[pTop] = 1;
            queue[qTail++] = pTop;
        }
        const pBot = (h - 1) * w + x;
        if (isWhite(pBot * 4) && !visited[pBot]) {
            visited[pBot] = 1;
            queue[qTail++] = pBot;
        }
    }

    // Seed left and right borders
    for (let y = 0; y < h; y++) {
        const pLeft = y * w;
        if (isWhite(pLeft * 4) && !visited[pLeft]) {
            visited[pLeft] = 1;
            queue[qTail++] = pLeft;
        }
        const pRight = y * w + (w - 1);
        if (isWhite(pRight * 4) && !visited[pRight]) {
            visited[pRight] = 1;
            queue[qTail++] = pRight;
        }
    }

    // Process BFS: turn visited background pixels transparent with smooth anti-aliased edge feathering
    while (qHead < qTail) {
        const p = queue[qHead++];
        const idx = p * 4;

        // Set alpha to 0 (fully transparent)
        data[idx + 3] = 0;

        const x = p % w;
        const y = Math.floor(p / w);

        // 4 connected neighbors
        if (x > 0) {
            const n = p - 1;
            if (!visited[n] && isWhite(n * 4)) {
                visited[n] = 1;
                queue[qTail++] = n;
            }
        }
        if (x < w - 1) {
            const n = p + 1;
            if (!visited[n] && isWhite(n * 4)) {
                visited[n] = 1;
                queue[qTail++] = n;
            }
        }
        if (y > 0) {
            const n = p - w;
            if (!visited[n] && isWhite(n * 4)) {
                visited[n] = 1;
                queue[qTail++] = n;
            }
        }
        if (y < h - 1) {
            const n = p + w;
            if (!visited[n] && isWhite(n * 4)) {
                visited[n] = 1;
                queue[qTail++] = n;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/webp', 0.92);
}

/**
 * Compresses an uploaded image file into high-quality WebP format
 * and automatically removes harsh white background blocks for dark-mode harmony.
 */
export function compressImageToWebP(file: File, maxDimension = 600): Promise<string> {
    return new Promise((resolve, reject) => {
        if (file.size > 8 * 1024 * 1024) {
            reject(new Error('Image size exceeds 8MB limit.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(event.target?.result as string);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Run white background removal on upload
                try {
                    const cleaned = removeWhiteBackgroundFromImage(img, 28);
                    resolve(cleaned);
                } catch {
                    try {
                        const webpUri = canvas.toDataURL('image/webp', 0.88);
                        resolve(webpUri);
                    } catch {
                        resolve(canvas.toDataURL('image/png', 0.88));
                    }
                }
            };
            img.onerror = () => reject(new Error('Failed to load image.'));
            img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
    });
}

/**
 * Retrieves a dark-mode optimized transparent version of any image URL.
 * Automatically caches results in memory to run only once per image.
 */
export function getOptimizedProductImage(src: string): Promise<string> {
    if (!src) return Promise.resolve('');
    if (imageCache.has(src)) {
        return Promise.resolve(imageCache.get(src)!);
    }

    return new Promise((resolve) => {
        const img = new Image();
        if (!src.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
            try {
                const cleaned = removeWhiteBackgroundFromImage(img, 28);
                imageCache.set(src, cleaned);
                resolve(cleaned);
            } catch {
                imageCache.set(src, src);
                resolve(src);
            }
        };
        img.onerror = () => {
            imageCache.set(src, src);
            resolve(src);
        };
        img.src = src;
    });
}
