
import { AnalysisResult } from '@/types';
import { User, Settings, History, CreditCard, Bell, Shield, LogOut, ChevronRight, BookOpen } from 'lucide-react';

interface MyPageTabProps {
    result: AnalysisResult;
    onLogout: () => void;
}

export default function MyPageTab({ result, onLogout }: MyPageTabProps) {
    const MENU_ITEMS = [
        {
            title: 'アカウント設定',
            items: [
                { icon: User, label: 'プロフィール編集', action: () => { } },
                { icon: Bell, label: '通知設定', action: () => { } },
                { icon: Shield, label: 'プライバシーとセキュリティ', action: () => { } },
            ]
        },
        {
            title: 'データ・履歴',
            items: [
                { icon: History, label: '過去の診断履歴', action: () => { } },
                { icon: BookOpen, label: '保存したアドバイス', action: () => { } },
            ]
        },
        {
            title: 'サブスクリプション',
            items: [
                { icon: CreditCard, label: 'プランの確認・変更', action: () => { } },
            ]
        },
        {
            title: 'アプリについて',
            items: [
                { icon: Settings, label: '開発者メッセージ（哲学）', action: () => { } },
                { icon: Settings, label: '利用規約', action: () => { } },
            ]
        }
    ];

    return (
        <div className="pb-24 space-y-6 px-4 pt-6">
            <header>
                <h1 className="text-2xl font-bold text-white font-serif mb-2">マイページ</h1>
            </header>

            {/* Profile Card */}
            <div className="glass p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-2xl font-bold text-black border-2 border-white/20">
                    {result.character.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">{result.character.name}</h2>
                    <p className="text-sm text-gray-400">
                        {result.birthDate} 生まれ
                    </p>
                    <div className="mt-2 flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-gold border border-gold/20">
                            {result.character.attributes.primary}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-gray-300 border border-white/10">
                            無料プラン
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-6">
                {MENU_ITEMS.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-bold text-gray-500 mb-2 ml-1">{section.title}</h3>
                        <div className="glass rounded-xl border border-white/10 overflow-hidden">
                            {section.items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={item.action}
                                    className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${i !== section.items.length - 1 ? 'border-b border-white/5' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-200">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Logout Button */}
            <button
                onClick={onLogout}
                className="w-full py-4 glass rounded-xl border border-red-500/30 text-red-400 text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                ログアウト（診断リセット）
            </button>

            <p className="text-center text-xs text-gray-600 pt-4">
                Version 1.0.0
            </p>
        </div>
    );
}
