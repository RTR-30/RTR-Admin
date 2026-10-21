import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SHADOWS } from "../../utils/ColorCode";

interface HeaderProps {
    value: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
    onRightPress?: () => void;
    showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    value,
    subtitle,
    rightAction,
    onRightPress,
    showBack = true,
}) => {
    const navigation: any = useNavigation();
    const insets = useSafeAreaInsets();
    const isHome = value === "Home";

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("Home");
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out of RTR Admin?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("storeData");
                        } catch {
                            // ignore
                        }
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Login" }],
                        });
                    },
                },
            ]
        );
    };

    return (
        <View
            style={[
                styles.container,
                { paddingTop: Math.max(insets.top, Platform.OS === "android" ? 8 : 12) },
            ]}
        >
            <View style={styles.contentRow}>
                {/* Left Action / Brand */}
                <View style={styles.leftContainer}>
                    {isHome ? (
                        <View style={styles.brandBadge}>
                            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                        </View>
                    ) : showBack ? (
                        <TouchableOpacity
                            onPress={handleBack}
                            activeOpacity={0.7}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Center Title */}
                <View style={styles.centerContainer}>
                    <Text style={styles.titleText} numberOfLines={1}>
                        {isHome ? "RTR Admin Console" : value}
                    </Text>
                    {subtitle ? (
                        <Text style={styles.subtitleText} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    ) : isHome ? (
                        <View style={styles.statusRow}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>RTR Operations</Text>
                        </View>
                    ) : null}
                </View>

                {/* Right Action */}
                <View style={styles.rightContainer}>
                    {rightAction ? (
                        <TouchableOpacity
                            onPress={onRightPress}
                            activeOpacity={0.7}
                            style={styles.actionButton}
                        >
                            {rightAction}
                        </TouchableOpacity>
                    ) : isHome ? (
                        <TouchableOpacity
                            onPress={handleLogout}
                            activeOpacity={0.7}
                            style={styles.logoutButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                </View>
            </View>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary,
        paddingBottom: 12,
        paddingHorizontal: 16,
        ...SHADOWS.md,
        zIndex: 50,
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 48,
    },
    leftContainer: {
        width: 44,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    brandBadge: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255, 255, 255, 0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    titleText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.3,
        textAlign: "center",
    },
    subtitleText: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 2,
        fontWeight: "500",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#4ADE80",
        marginRight: 5,
    },
    statusText: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "500",
    },
    rightContainer: {
        width: 44,
        alignItems: "flex-end",
        justifyContent: "center",
    },
    logoutButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255, 255, 255, 0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    actionButton: {
        padding: 6,
    },
    placeholder: {
        width: 38,
    },
});