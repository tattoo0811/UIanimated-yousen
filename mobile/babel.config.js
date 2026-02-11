module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // Temporarily disabled for Expo Go compatibility
            // "react-native-reanimated/plugin",
        ]
    };
};
