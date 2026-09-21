import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
} from "react-native";
import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { appVersionServices, updateAppVersionServices } from "./helper";

const AppVersionControl = () => {
    const value = "App Version Control";

    const [loading, setLoading] = useState<boolean>(false);
    const [appVersion, setAppVersions] = useState<any[]>([]);

    const fetchAppVersions = async () => {
        setLoading(true);

        try {
            const res = await appVersionServices();

            const {
                data: {
                    data = [],
                    success = false,
                    message = "",
                },
            } = res;

            if (success === true) {
                setAppVersions(data);
            } else {
                showError(message);
            }
        } catch (error: any) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        id: number,
        field: "latest_version" | "min_required_version",
        value: string
    ) => {
        setAppVersions((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    };

    const handleUpdate = async (item: any) => {
        if (!item.latest_version?.trim()) {
            showError("Please enter latest version");
            return;
        }

        if (!item.min_required_version?.trim()) {
            showError("Please enter minimum required version");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                latest_version: item.latest_version.trim(),
                min_required_version: item.min_required_version.trim(),
                force_update: false,
                update_url: null,
                message: null
            };

            const res = await updateAppVersionServices(payload, item.id);
            console.log(res?.data);
            const { data: { success = false, message = "" } } = res;
            
            if (success) {
                showSuccess(message || "Version updated successfully");
                fetchAppVersions();
            } else {
                showError(message || "Version update failed");
            }
        } catch (error: any) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const renderList = ({ item }: any) => {
        return (
            <View style={styles.card}>

                {/* Header */}
                <View style={styles.titleRow}>
                    <Text style={styles.title}>
                        {item.app_type} - {item.platform}
                    </Text>
                </View>

                {/* Latest Version */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Latest Version
                    </Text>

                    <TextInput
                        value={item.latest_version}
                        onChangeText={(text) =>
                            handleChange(
                                item.id,
                                "latest_version",
                                text
                            )
                        }
                        placeholder="Enter latest version"
                        placeholderTextColor="#999"
                        style={styles.input}
                        keyboardType="decimal-pad"
                    />
                </View>

                {/* Minimum Version */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Minimum Required Version
                    </Text>

                    <TextInput
                        value={item.min_required_version}
                        onChangeText={(text) =>
                            handleChange(
                                item.id,
                                "min_required_version",
                                text
                            )
                        }
                        placeholder="Enter minimum version"
                        placeholderTextColor="#999"
                        style={styles.input}
                        keyboardType="decimal-pad"
                    />
                </View>

                {/* Update Button */}
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => handleUpdate(item)}
                    disabled={loading}
                >
                    <Text style={styles.updateButtonText}>
                        {loading ? "Updating..." : "Update Version"}
                    </Text>
                </TouchableOpacity>

            </View>
        );
    };

    useEffect(() => {
        fetchAppVersions();
    }, []);

    return (
        <View style={styles.container}>

            <Header value={value} />

            <View style={styles.listContainer}>
                <FlatList
                    data={appVersion}
                    renderItem={renderList}
                    keyExtractor={(item, index) =>
                        item.id?.toString() || index.toString()
                    }
                    removeClippedSubviews={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No app versions found.
                        </Text>
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 20,
                        gap: 10,
                    }}
                />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    listContainer: {
        flex: 1,
        padding: 15,
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },

    titleRow: {
        marginBottom: 15,
    },

    title: {
        fontSize: 16,
        fontWeight: "600",
        textTransform: "capitalize",
    },

    inputContainer: {
        marginBottom: 12,
    },

    label: {
        color: "#777",
        fontSize: 12,
        marginBottom: 6,
    },

    input: {
        height: 45,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        color: "#222",
        backgroundColor: "#fafafa",
    },

    updateButton: {
        height: 45,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
    },

    updateButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "gray",
    },
});

export default AppVersionControl;