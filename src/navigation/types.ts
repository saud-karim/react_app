// Navigation Types
export type RootStackParamList = {
    // Auth Stack
    Login: undefined;
    Register: undefined;

    // Main Stack
    MainTabs: undefined;
    Chatbot: undefined;
    EventDetails: { eventId: number };
    DealDetails: { dealId: number };
    NewsDetails: { newsId: number };
    Notifications: undefined;
};

export type BottomTabParamList = {
    HomeTab: undefined;
    EventsTab: undefined;
    DealsTab: undefined;
    NewsTab: undefined;
    ProfileTab: undefined;
};

// Declare the navigation types globally
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
