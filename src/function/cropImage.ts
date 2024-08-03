import sharp from "sharp";

export async function changeAspectRatio(inputBuffer: Buffer, targetWidth: number, targetHeight: number) {
    try {
        const image = sharp(inputBuffer);
        
        const metadata = await image.metadata();
        
        if (!metadata.width || !metadata.height) {
            throw new Error('Could not get image dimensions');
        }
  
        const originalAspect: number = +(metadata.width/metadata.height).toFixed(2)
        if (originalAspect >= 2.5){
            return inputBuffer;
        }
        console.log(`current dimensions ${metadata.width}x${metadata.height}, aspect=${metadata.width/metadata.height}`)
        
        const outputBuffer : Buffer = await image
            .resize({
                width: targetWidth,
                height: targetHeight,
                fit: sharp.fit.contain,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();
  
        const newMetadata = await sharp(outputBuffer).metadata();
        if (!metadata || !metadata.width || !metadata.height) {
            throw new Error('Could not get metadata of resized image.');
        }
        console.log(`\nnew dimensions ${newMetadata.width}x${newMetadata.height}`);
        return outputBuffer;
    } catch (error) {
        console.error('Error changing image aspect ratio:', error);
    }
  }