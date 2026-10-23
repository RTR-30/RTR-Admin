import React, { useState } from "react";
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
import { CreateRoleService } from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const slugify = (text: string) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "_")
        .replace(/^-+|-+$/g, "");
};

const CreateRole = () => {
    const value = "Create Role";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
    });

    const handleNameChange = (text: string) => {
        if (!isSlugManuallyEdited) {
            setForm((prev) => ({
                ...prev,
                name: text,
                slug: slugify(text),
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                name: text,
            }));
        }
    };

    const handleSlugChange = (text: string) => {
        setIsSlugManuallyEdited(true);
        // keep slug formatted (lowercase, underscore/hyphen)
        const formatted = text.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
        setForm((prev) => ({
            ...prev,
            slug: formatted,
        }));
    };

    const handleCreateRole = async () => {
        const trimmedName = form.name.trim();
        const trimmedSlug = form.slug.trim();
        const trimmedDesc = form.description.trim();

        if (!trimmedName) {
            showError("Please enter a role name");
            return;
        }

        if (!trimmedSlug) {
            showError("Please enter a role slug");
            return;
        }

        if (!trimmedDesc) {
            showError("Please enter a role description");
            return;
        }

        setLoading(true);
        const payload = {
            name: trimmedName,
            slug: trimmedSlug,
            description: trimmedDesc,
        };

        try {
            const res = await CreateRoleService(payload);
            const { data: { message = "", success = false } = {}, status } = res || {};

            if (success === true || status === 200 || status === 201) {
                showSuccess(message || "Role created successfully");
                navigation.goBack();
            } else {
                showError(message || "Failed to create role");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to create role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Add New System Administrative Role" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Information Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerIconWrapper}>
                        <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
                    </View>
                    <View style={styles.bannerTextWrapper}>
                        <Text style={styles.bannerTitle}>Role-Based Access Control</Text>
                        <Text style={styles.bannerSubtitle}>
                            Roles define administrative scope and govern dashboard module visibility across the platform.
                        </Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Role Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Role Name</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                placeholder="e.g. Operations Manager"
                                placeholderTextColor="#94A3B8"
                                value={form.name}
                                onChangeText={handleNameChange}
                                style={styles.textInput}
                                autoCapitalize="words"
                            />
                        </View>
                        <Text style={styles.inputHelp}>Human-readable title displayed on user profiles and cards.</Text>
                    </View>

                    {/* Role Slug */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.fieldLabel}>Role Slug / Identifier</Text>
                            {isSlugManuallyEdited && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsSlugManuallyEdited(false);
                                        setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
                                    }}
                                >
                                    <Text style={styles.resetSlugText}>Reset to auto</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="key-outline" size={18} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                placeholder="e.g. operations_manager"
                                placeholderTextColor="#94A3B8"
                                value={form.slug}
                                onChangeText={handleSlugChange}
                                style={[styles.textInput, styles.slugInput]}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <Text style={styles.inputHelp}>
                            Unique system key used by backend permissions and API checks.
                        </Text>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Description</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <Ionicons
                                name="document-text-outline"
                                size={18}
                                color="#64748B"
                                style={[styles.inputIcon, styles.textAreaIcon]}
                            />
                            <TextInput
                                placeholder="e.g. Manages bookings, partners, and customer escalation issues"
                                placeholderTextColor="#94A3B8"
                                value={form.description}
                                onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
                                style={[styles.textInput, styles.textAreaInput]}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                        <Text style={styles.inputHelp}>
                            Detailed explanation of access boundaries and administrative duties.
                        </Text>
                    </View>

                    {/* Live Preview Card */}
                    <View style={styles.previewBox}>
                        <View style={styles.previewHeader}>
                            <Ionicons name="eye-outline" size={16} color="#4F46E5" />
                            <Text style={styles.previewTitle}>Live Role Preview</Text>
                        </View>
                        <View style={styles.previewContent}>
                            <View style={styles.previewTopRow}>
                                <Text style={styles.previewRoleName}>
                                    {form.name.trim() || "Role Name"}
                                </Text>
                                <View style={styles.slugBadge}>
                                    <Text style={styles.slugBadgeText}>
                                        {form.slug.trim() || "role_slug"}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.previewDesc}>
                                {form.description.trim() || "Role description will appear here..."}
                            </Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCreateRole}
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
                                <Text style={styles.submitButtonText}>Create Role</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateRole;

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
        backgroundColor: "#EEF2FF",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#C7D2FE",
        ...SHADOWS.sm,
    },
    bannerIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#E0E7FF",
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
        color: "#3730A3",
    },
    bannerSubtitle: {
        fontSize: 12,
        color: "#4338CA",
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
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 6,
    },
    resetSlugText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#4F46E5",
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
    slugInput: {
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        color: "#4F46E5",
    },
    textAreaWrapper: {
        alignItems: "flex-start",
        paddingVertical: 10,
    },
    textAreaIcon: {
        marginTop: 4,
    },
    textAreaInput: {
        height: 80,
    },
    inputHelp: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 4,
        paddingHorizontal: 2,
    },
    previewBox: {
        backgroundColor: "#F8FAFC",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 20,
    },
    previewHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 6,
    },
    previewTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: "#4F46E5",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    previewContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    previewTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    previewRoleName: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
        flex: 1,
    },
    slugBadge: {
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#C7D2FE",
    },
    slugBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#4F46E5",
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
    previewDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
    submitButton: {
        backgroundColor: "#4F46E5",
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
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
