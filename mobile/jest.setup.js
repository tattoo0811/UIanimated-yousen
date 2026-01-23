jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Firebase
jest.mock('@react-native-firebase/app', () => {
    return {
        utils: () => ({
            FilePath: {
                PICTURES_DIRECTORY: 'pictures',
            },
        }),
    };
});

jest.mock('@react-native-firebase/analytics', () => () => ({
    logEvent: jest.fn(),
    setUserProperty: jest.fn(),
    setUserId: jest.fn(),
    setCurrentScreen: jest.fn(),
}));

jest.mock('@react-native-firebase/crashlytics', () => () => ({
    recordError: jest.fn(),
    log: jest.fn(),
    setUserId: jest.fn(),
    setAttribute: jest.fn(),
    setAttributes: jest.fn(),
    crash: jest.fn(),
    didCrashOnPreviousExecution: jest.fn(),
}));
