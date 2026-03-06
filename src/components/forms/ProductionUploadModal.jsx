import { useState } from "react";
import { X, Link as LinkIcon, UploadCloud, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { ButtonAvaloon } from "@/components/ui/ButtonAvaloon";
import { googleDriveService } from "@/services/googleDriveService";

export function ProductionUploadModal({ onClose, onSuccess }) {
    const [driveLink, setDriveLink] = useState("");
    const [isCounting, setIsCounting] = useState(false);
    const [result, setResult] = useState(null); // { count: number, error: string }

    const handleCountFiles = async () => {
        setIsCounting(true);
        setResult(null);

        const folderId = googleDriveService.extractFolderId(driveLink);

        if (!folderId) {
            setResult({ count: 0, error: "Link inválido. Certifique-se de que é um link válido de pasta do Google Drive." });
            setIsCounting(false);
            return;
        }

        try {
            const count = await googleDriveService.getFileCount(folderId);
            setResult({ count, error: null });
        } catch (error) {
            console.error("Drive error:", error);
            setResult({ count: 0, error: `Erro do Google: ${error.message}` });
        } finally {
            setIsCounting(false);
        }
    };

    const handleSave = () => {
        // In a real app, save this to the database
        if (onSuccess && result && result.count > 0) {
            onSuccess({
                link: driveLink,
                fileCount: result.count
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-main">
            <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-avaloon-orange" />
                    Registrar Produção
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-main/10 rounded-full text-muted hover:text-main transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                        Link da Pasta do Google Drive
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                            <input
                                type="url"
                                placeholder="https://drive.google.com/drive/folders/..."
                                value={driveLink}
                                onChange={(e) => setDriveLink(e.target.value)}
                                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-main focus:border-avaloon-orange outline-none transition-colors"
                            />
                        </div>
                        <ButtonAvaloon
                            onClick={handleCountFiles}
                            disabled={!driveLink || isCounting}
                            variant="secondary"
                            className="whitespace-nowrap"
                        >
                            {isCounting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Contar Arquivos'}
                        </ButtonAvaloon>
                    </div>
                </div>

                {/* Expected Results Area */}
                {result && (
                    <div className={`p-4 rounded-xl border ${result.error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'} transition-all`}>
                        {result.error ? (
                            <div className="flex items-start gap-3 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{result.error}</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between text-green-400">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold">Leitura Concluída!</p>
                                        <p className="text-sm text-green-500/80">O sistema identificou arquivos nesta pasta.</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-black">{result.count}</div>
                            </div>
                        )}
                    </div>
                )}

                {!result && (
                    <div className="text-sm text-dim bg-card p-4 rounded-lg border border-border">
                        <p className="font-bold text-muted mb-1">Importante:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Certifique-se de que a pasta no Drive está configurada como <strong>"Qualquer pessoa com o link"</strong>.</li>
                            <li>Somente os arquivos diretamente dentro da pasta principal serão contados.</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-border bg-card flex justify-end gap-3">
                <ButtonAvaloon variant="tertiary" onClick={onClose}>
                    Cancelar
                </ButtonAvaloon>
                <ButtonAvaloon
                    variant="primary"
                    onClick={handleSave}
                    disabled={!result || result.error || result.count === 0}
                >
                    Salvar Registros
                </ButtonAvaloon>
            </div>
        </div>
    );
}
