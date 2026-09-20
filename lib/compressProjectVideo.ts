const TARGET_VIDEO_BYTES = 27 * 1024 * 1024;
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;
const AUDIO_BITRATE = 80_000;
const MAX_VIDEO_BITRATE = 12_000_000;
const MIN_VIDEO_BITRATE = 500_000;
const FIRST_PASS_BITRATE_BOOST = 6;

type OutputProfile = {
  extension: "mp4" | "webm";
  mimeType: "video/mp4" | "video/webm";
  videoCodec: "avc" | "vp9";
  audioCodec: "aac" | "opus";
};

const OUTPUT_PROFILES: OutputProfile[] = [
  { extension: "webm", mimeType: "video/webm", videoCodec: "vp9", audioCodec: "opus" },
  { extension: "mp4", mimeType: "video/mp4", videoCodec: "avc", audioCodec: "aac" },
];

function getOutputDimensions(width: number, height: number) {
  const scale = Math.min(1, 1920 / width, 1200 / height);
  return {
    width: Math.max(2, Math.floor((width * scale) / 2) * 2),
    height: Math.max(2, Math.floor((height * scale) / 2) * 2),
  };
}

function getVideoBitrate(duration: number) {
  const availableBitrate = (TARGET_VIDEO_BYTES * 8 * 0.94) / duration - AUDIO_BITRATE;
  return Math.round(Math.min(MAX_VIDEO_BITRATE, Math.max(MIN_VIDEO_BITRATE, availableBitrate * FIRST_PASS_BITRATE_BOOST)));
}

function correctedBitrate(currentBitrate: number, outputBytes: number) {
  const correction = (TARGET_VIDEO_BYTES / outputBytes) * 0.95;
  return Math.round(Math.min(MAX_VIDEO_BITRATE, Math.max(MIN_VIDEO_BITRATE, currentBitrate * correction)));
}

export async function compressProjectVideo(file: File, duration: number, onProgress: (progress: number) => void) {
  const {
    ALL_FORMATS,
    BlobSource,
    BufferTarget,
    Conversion,
    Input,
    Mp4OutputFormat,
    Output,
    WebMOutputFormat,
  } = await import("mediabunny");

  if (!("VideoEncoder" in window && "VideoDecoder" in window)) {
    throw new Error("Video optimization is not supported in this browser. Please use the latest Chrome or Edge.");
  }

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const baseName = file.name.replace(/\.[^.]+$/, "") || "project-demo";
  try {
    const [videoTrack, audioTrack] = await Promise.all([
      input.getPrimaryVideoTrack(),
      input.getPrimaryAudioTrack(),
    ]);
    if (!videoTrack) throw new Error("This file does not contain a readable video track.");

    const [sourceWidth, sourceHeight] = await Promise.all([
      videoTrack.getDisplayWidth(),
      videoTrack.getDisplayHeight(),
    ]);
    const dimensions = getOutputDimensions(sourceWidth, sourceHeight);
    const initialBitrate = getVideoBitrate(duration);

    for (const profile of OUTPUT_PROFILES) {
      const encode = async (
        bitrate: number,
        progressStart: number,
        progressRange: number,
        hardwareAcceleration: "prefer-hardware" | "prefer-software",
      ) => {
        const target = new BufferTarget();
        const output = new Output({
          format: profile.extension === "mp4" ? new Mp4OutputFormat({ fastStart: "in-memory" }) : new WebMOutputFormat(),
          target,
        });
        const conversion = await Conversion.init({
          input,
          output,
          tracks: "primary",
          video: {
            ...dimensions,
            fit: "contain",
            codec: profile.videoCodec,
            bitrate,
            frameRate: 20,
            forceTranscode: true,
            hardwareAcceleration,
            keyFrameInterval: 4,
          },
          audio: {
            codec: profile.audioCodec,
            bitrate: AUDIO_BITRATE,
            forceTranscode: true,
          },
          tags: {},
        });

        if (!conversion.isValid || (audioTrack && !conversion.utilizedTracks.includes(audioTrack))) return null;
        conversion.onProgress = (progress) => onProgress(Math.min(99, Math.round(progressStart + progress * progressRange)));
        try {
          await conversion.execute();
        } catch {
          return null;
        }
        if (!target.buffer) return null;
        return new File([target.buffer], `${baseName}-optimized.${profile.extension}`, { type: profile.mimeType });
      };

      for (const acceleration of ["prefer-hardware", "prefer-software"] as const) {
        const firstPass = await encode(initialBitrate, 0, 75, acceleration);
        if (!firstPass) continue;
        if (firstPass.size <= MAX_VIDEO_BYTES) {
          onProgress(100);
          return firstPass;
        }

        const retryBitrate = correctedBitrate(initialBitrate, firstPass.size);
        const secondPass = retryBitrate !== initialBitrate ? await encode(retryBitrate, 75, 24, acceleration) : null;
        if (secondPass && secondPass.size <= MAX_VIDEO_BYTES) {
          onProgress(100);
          return secondPass;
        }
      }
    }

    throw new Error("This video could not be optimized on this device. Try closing other apps and upload it again.");
  } finally {
    input.dispose();
  }
}
