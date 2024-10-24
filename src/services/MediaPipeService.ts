import { TextClassifier, FilesetResolver } from '@mediapipe/tasks-text';

class MediaPipeService {
    private static instance: MediaPipeService;
    private classifier: TextClassifier | null = null;
    private initializationPromise: Promise<TextClassifier> | null = null;

    private constructor() { }

    public static getInstance(): MediaPipeService {
        if (!MediaPipeService.instance) {
            MediaPipeService.instance = new MediaPipeService();
        }
        return MediaPipeService.instance;
    }

    public async getClassifier(): Promise<TextClassifier> {
        if (this.classifier) {
            return this.classifier;
        }

        // Nếu đang có một quá trình khởi tạo, trả về promise đó
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        // Khởi tạo mới nếu chưa có
        this.initializationPromise = this.initializeClassifier();
        this.classifier = await this.initializationPromise;
        this.initializationPromise = null;

        return this.classifier;
    }

    private async initializeClassifier(): Promise<TextClassifier> {
        try {
            const text = await FilesetResolver.forTextTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-text@0.10.0/wasm"
            );

            const classifier = await TextClassifier.createFromOptions(text, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/text_classifier/bert_classifier/float32/1/bert_classifier.tflite`
                },
                maxResults: 5
            });

            return classifier;
        } catch (error) {
            console.error('Lỗi khởi tạo MediaPipe classifier:', error);
            throw error;
        }
    }

    public async closeClassifier(): Promise<void> {
        if (this.classifier) {
            await this.classifier.close();
            this.classifier = null;
        }
    }
}

export default MediaPipeService;
