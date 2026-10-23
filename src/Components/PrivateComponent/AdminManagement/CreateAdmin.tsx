import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { CreateAdminService, GetRolesService } from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

interface RoleOption {
    id: number | string;
    name: string;
    slug?: string;
    description?: string;
}

const CreateAdmin = () => {
    const value = "Create Admin";
    const navigation: any = useNavigation();

    const [loading, setLoading] = useState(false);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState<{
        name: string;
        email: string;
        password: string;
        role_id: number | string;
    }>({
        name: "",
        email: "",
        password: "",
        role_id: "",
    });

    const loadRoles = async () => {
        setRolesLoading(true);
        try {
            const res = await GetRolesService();
            const data =
                res?.data?.data ||
                res?.data?.roles ||
                (Array.isArray(res?.data) ? res.data : []);

            if (Array.isArray(data) && data.length > 0) {
                setRoles(data);
                // Pre-select first role if available
                setForm((prev) => ({
                    ...prev,
                    role_id: prev.role_id || data[0].id,
                }));
            }
        } catch (error) {
            console.log("Could not load roles for admin creation", error);
        } finally {
            setRolesLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleCreateAdmin = async () => {
        const trimmedName = form.name.trim();
        const trimmedEmail = form.email.trim();
        const password = form.password;
        const roleId = form.role_id;

        if (!trimmedName) {
            showError("Please enter full name");
            return;
        }

        if (!trimmedEmail) {
            showError("Please enter email address");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            showError("Please enter a valid email address");
            return;
        }

        if (!password || password.length < 6) {
            showError("Password must be at least 6 characters");
            return;
        }

        if (!roleId && roleId !== 0) {
            showError("Please select an administrative role");
            return;
        }

        setLoading(true);
        const payload = {
            name: trimmedName,
            email: trimmedEmail,
            password: password,
            role_id: Number(roleId) || roleId,
        };

        try {
            const res = await CreateAdminService(payload);
            const { data: { message = "", success = false } = {}, status } = res || {};

            if (success === true || status === 200 || status === 201) {
                showSuccess(message || "Admin account created successfully");
                navigation.goBack();
            } else {
                showError(message || "Failed to create admin user");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to create admin user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Provision Admin Access & Role" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Info Card */}
                <View style={styles.banner}>
                    <View style={styles.bannerIconWrapper}>
                        <Ionicons name="person-add" size={24} color="#059669" />
                    </View>
                    <View style={styles.bannerTextWrapper}>
                        <Text style={styles.bannerTitle}>Administrator Provisioning</Text>
                        <Text style={styles.bannerSubtitle}>
                            Create authenticated staff accounts and attach specific permission roles.
                        </Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                placeholder="e.g. Jane Support"
                                placeholderTextColor="#94A3B8"
                                value={form.name}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                                style={styles.textInput}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Email Address */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                placeholder="e.g. jane.support@rtr.com"
                                placeholderTextColor="#94A3B8"
                                value={form.email}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                                style={styles.textInput}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <Text style={styles.inputHelp}>Used for administrator login authentication.</Text>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Temporary Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Secure password (min 6 characters)"
                                placeholderTextColor="#94A3B8"
                                value={form.password}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                                style={styles.textInput}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#64748B"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Role Selection */}
                    <View style={styles.inputGroup}>
                        <View style={styles.roleHeaderRow}>
                            <Text style={styles.fieldLabel}>Assigned Role</Text>
                            {rolesLoading && <ActivityIndicator size="small" color="#059669" />}
                        </View>

                        {roles.length > 0 ? (
                            <View style={styles.roleSelectorContainer}>
                                {roles.map((r) => {
                                    const isSelected = String(form.role_id) === String(r.id);
                                    return (
                                        <TouchableOpacity
                                            key={String(r.id)}
                                            style={[
                                                styles.roleChoiceCard,
                                                isSelected && styles.roleChoiceCardSelected,
                                            ]}
                                            onPress={() => setForm((prev) => ({ ...prev, role_id: r.id }))}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.roleChoiceTop}>
                                                <View style={styles.roleNameRow}>
                                                    <Ionicons
                                                        name={isSelected ? "radio-button-on" : "radio-button-off"}
                                                        size={18}
                                                        color={isSelected ? "#059669" : "#94A3B8"}
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.roleChoiceName,
                                                            isSelected && styles.roleChoiceNameSelected,
                                                        ]}
                                                    >
                                                        {r.name}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={[
                                                        styles.roleIdBadge,
                                                        isSelected && styles.roleIdBadgeSelected,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.roleIdBadgeText,
                                                            isSelected && styles.roleIdBadgeTextSelected,
                                                        ]}
                                                    >
                                                        ID: {r.id}
                                                    </Text>
                                                </View>
                                            </View>
                                            {r.description ? (
                                                <Text
                                                    style={styles.roleChoiceDesc}
                                                    numberOfLines={2}
                                                >
                                                    {r.description}
                                                </Text>
                                            ) : null}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={styles.inputWrapper}>
                                <Ionicons name="shield-outline" size={18} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Enter Role ID (e.g. 1 for Superadmin, 2, 3)"
                                    placeholderTextColor="#94A3B8"
                                    value={String(form.role_id)}
                                    onChangeText={(text) => setForm((prev) => ({ ...prev, role_id: text }))}
                                    style={styles.textInput}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}
                        <Text style={styles.inputHelp}>
                            Determines dashboard modules and administrative authority granted.
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCreateAdmin}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={18}
                                    color="#FFFFFF"
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.submitButtonText}>Create Admin User</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateAdmin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    banner: {
        backgroundColor: "#ECFDF5",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#A7F3D0",
        ...SHADOWS.sm,
    },
    bannerIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    bannerTextWrapper: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#065F46",
    },
    bannerSubtitle: {
        fontSize: 12,
        color: "#047857",
        marginTop: 2,
        lineHeight: 16,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    inputGroup: {
        marginBottom: 18,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 6,
    },
    roleHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        height: 46,
        fontSize: 14,
        color: COLORS.textMain,
    },
    eyeBtn: {
        padding: 6,
    },
    inputHelp: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 4,
        paddingHorizontal: 2,
    },
    roleSelectorContainer: {
        gap: 8,
        marginTop: 4,
    },
    roleChoiceCard: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 12,
    },
    roleChoiceCardSelected: {
        backgroundColor: "#F0FDF4",
        borderColor: "#10B981",
    },
    roleChoiceTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    roleNameRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    roleChoiceName: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.textMain,
    },
    roleChoiceNameSelected: {
        fontWeight: "700",
        color: "#065F46",
    },
    roleIdBadge: {
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleIdBadgeSelected: {
        backgroundColor: "#DCFCE7",
    },
    roleIdBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748B",
    },
    roleIdBadgeTextSelected: {
        color: "#047857",
    },
    roleChoiceDesc: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 6,
        marginLeft: 26,
        lineHeight: 15,
    },
    submitButton: {
        backgroundColor: "#059669",
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
        ...SHADOWS.sm,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    buttonInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonIcon: {
        marginRight: 6,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
