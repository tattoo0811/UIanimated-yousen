import { useWindowDimensions } from 'react-native';

/**
 * レスポンシブフック
 * タブレット対応とレイアウト調整用
 */
export function useResponsive() {
    const { width, height } = useWindowDimensions();

    const isTablet = width >= 768;
    const isLandscape = width > height;

    return {
        // デバイス判定
        isTablet,
        isLandscape,
        isPhone: !isTablet,

        // コンテナ幅（タブレットでは最大幅を制限）
        containerWidth: isTablet ? Math.min(width * 0.8, 800) : width,
        contentPadding: isTablet ? 32 : 16,

        // フォントサイズ（タブレットで拡大）
        fontSize: {
            xs: isTablet ? 14 : 12,
            sm: isTablet ? 16 : 14,
            md: isTablet ? 20 : 18,
            lg: isTablet ? 28 : 24,
            xl: isTablet ? 36 : 32,
            xxl: isTablet ? 48 : 40,
        },

        // スペーシング
        spacing: {
            xs: isTablet ? 6 : 4,
            sm: isTablet ? 12 : 8,
            md: isTablet ? 20 : 16,
            lg: isTablet ? 32 : 24,
            xl: isTablet ? 48 : 32,
        },

        // カードサイズ
        cardWidth: isTablet ? Math.min(width * 0.4, 360) : width - 32,

        // 画面サイズ
        screenWidth: width,
        screenHeight: height,
    };
}
