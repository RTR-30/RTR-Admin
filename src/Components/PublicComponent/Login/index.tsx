import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

import { showError, showSuccess } from "../../../Common/ToastMessage";
import { loginService } from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const Login = () => {
    const navigation: any = useNavigation();
    const [loader, setLoader] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);

    const [user, setUser] = useState({
        name: "",
        password: "",
    });

    const handleLogin = async () => {
        if (!user.name.trim() || !user.password.trim()) {
            showError("Email and password are required");
            return;
        }

        setLoader(true);
        const payload = {
            email: user?.name.trim(),
            password: user?.password,
        };

        try {
            const res = await loginService(payload);
            const { status, message, token, admin } = res?.data || {};

            if (status === 200) {
                const storedData = {
                    admin: admin,
                    token: token,
                };
                await AsyncStorage.setItem("storeData", JSON.stringify(storedData));

                navigation.navigate("Home");
                showSuccess(message || "Login successful");
                setUser({
                    name: "",
                    password: "",
                });
            } else {
                showError(message || "Authentication failed");
            }
        } catch (error: any) {
            showError(error?.message || "Check your credentials or connection");
        } finally {
            setLoader(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Branding Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="car-sport" size={36} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appTitle}>Drive4U RTR</Text>
                    <Text style={styles.appSubtitle}>Fleet & Operations Admin Portal</Text>
                </View>

                {/* Login Card */}
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Sign In</Text>
                    <Text style={styles.cardSubheader}>
                        Enter your credentials to access the admin console
                    </Text>

                    {/* Email Input */}
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View
                        style={[
                            styles.inputWrapper,
                            focusedInput === "email" && styles.inputWrapperFocused,
                        ]}
                    >
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={focusedInput === "email" ? COLORS.primary : "#94A3B8"}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            value={user.name}
                            onChangeText={(text) => setUser({ ...user, name: text })}
                            placeholder="admin@drive4u.com"
                            placeholderTextColor="#94A3B8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={() => setFocusedInput("email")}
                            onBlur={() => setFocusedInput(null)}
                            style={styles.textInput}
                        />
                    </View>

                    {/* Password Input */}
                    <Text style={styles.inputLabel}>Password</Text>
                    <View
                        style={[
                            styles.inputWrapper,
                            focusedInput === "password" && styles.inputWrapperFocused,
                        ]}
                    >
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={focusedInput === "password" ? COLORS.primary : "#94A3B8"}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            value={user.password}
                            onChangeText={(text) => setUser({ ...user, password: text })}
                            placeholder="••••••••••••"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            onFocus={() => setFocusedInput("password")}
                            onBlur={() => setFocusedInput(null)}
                            style={styles.textInput}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#64748B"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loader}
                        activeOpacity={0.85}
                        style={[styles.submitButton, loader && styles.submitButtonDisabled]}
                    >
                        {loader ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.submitButtonText}>Sign In</Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={18}
                                    color="#FFFFFF"
                                    style={styles.buttonIcon}
                                />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Security Badge */}
                    <View style={styles.securityRow}>
                        <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
                        <Text style={styles.securityText}>Authorized Personnel Only • 256-Bit SSL</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    heroSection: {
        alignItems: "center",
        marginBottom: 28,
    },
    logoBadge: {
        width: 68,
        height: 68,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
        ...SHADOWS.md,
    },
    appTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: COLORS.textMain,
        letterSpacing: 0.5,
    },
    appSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontWeight: "500",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.lg,
    },
    cardHeader: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 4,
    },
    cardSubheader: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 22,
        lineHeight: 18,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textMain,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 50,
        marginBottom: 16,
    },
    inputWrapperFocused: {
        borderColor: COLORS.primary,
        backgroundColor: "#FFFFFF",
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    eyeButton: {
        padding: 4,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        ...SHADOWS.md,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    buttonIcon: {
        marginLeft: 8,
    },
    securityRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    securityText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginLeft: 6,
        fontWeight: "500",
    },
});
