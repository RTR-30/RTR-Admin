import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    TextInput,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useRoute } from "@react-navigation/native";

import Header from "../../../Common/PageHeader";
import { COLORS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { updatePartnerStatusService } from "./helperapi";

const CarDriverDetails = () => {
    const value = "Partner Details";

    const route = useRoute<any>();
    const { carDriver } = route.params;

    const [loader, setLoader] = useState<boolean>(false);

    const [modalVisible, setModalVisible] =
        useState<boolean>(false);

    const [datePickerOpen, setDatePickerOpen] =
        useState<boolean>(false);

    const [modalType, setModalType] =
        useState<"SUSPEND" | "BLOCK">("SUSPEND");

    const [userInput, setUserInput] = useState<any>({
        status: "",
        suspended_until: "",
        reason: "",
    });

    // ----------------------------------------
    // OPEN SUSPEND / BLOCK MODAL
    // ----------------------------------------
    const openStatusModal = (
        type: "SUSPEND" | "BLOCK"
    ) => {
        setModalType(type);

        setUserInput({
            status:
                type === "SUSPEND"
                    ? "SUSPENDED"
                    : "BLOCKED",
            suspended_until: "",
            reason: "",
        });

        setModalVisible(true);
    };

    // ----------------------------------------
    // CLOSE MODAL
    // ----------------------------------------
    const closeModal = () => {
        if (loader) {
            return;
        }

        setModalVisible(false);
        setDatePickerOpen(false);

        setUserInput({
            status: "",
            suspended_until: "",
            reason: "",
        });
    };

    // ----------------------------------------
    // DATE FORMAT
    // ----------------------------------------
    const formatDisplayDate = (dateString: string) => {
        if (!dateString) {
            return "Select Date";
        }

        const date = new Date(dateString);

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // ----------------------------------------
    // UPDATE DRIVER STATUS
    // ----------------------------------------
    const handleUpdateStatus = async () => {
        if (!userInput.reason.trim()) {
            showError("Please enter reason");
            return;
        }

        if (
            modalType === "SUSPEND" &&
            !userInput.suspended_until
        ) {
            showError("Please select suspended date");
            return;
        }

        try {
            setLoader(true);

            let payload: any = {};

            if (modalType === "SUSPEND") {
                payload = {
                    status: "SUSPENDED",
                    suspended_until:
                        userInput.suspended_until,
                    reason: userInput.reason.trim(),
                };
            } else {
                payload = {
                    status: "BLOCKED",
                    reason: userInput.reason.trim(),
                };
            }

            const response =
                await updatePartnerStatusService(
                    carDriver?.id,
                    payload
                );

            if (
                response?.status === 200 ||
                response?.status === 201
            ) {
                showSuccess(
                    modalType === "SUSPEND"
                        ? "Partner suspended successfully"
                        : "Partner blocked successfully"
                );

                closeModal();
            } else {
                showError(
                    response?.data?.message ||
                    "Unable to update partner status"
                );
            }
        } catch (error) {
            showError(
                "Unable to update partner status"
            );
        } finally {
            setLoader(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Header value={value} />
            </View>

            {/* CONTENT */}
            <View style={styles.content}>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>
                        Basic Details
                    </Text>

                    {/* DRIVER DETAILS */}
                    <View style={styles.card}>

                        {/* ID + NAME */}
                        <View style={styles.row}>

                            <View style={styles.column}>
                                <Text style={styles.label}>
                                    ID
                                </Text>

                                <Text style={styles.value}>
                                    {carDriver?.id || "-"}
                                </Text>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.label}>
                                    Name
                                </Text>

                                <Text style={styles.value}>
                                    {carDriver?.name || "-"}
                                </Text>
                            </View>

                        </View>

                        {/* EMAIL + PHONE */}
                        <View style={styles.row}>

                            <View style={styles.column}>
                                <Text style={styles.label}>
                                    Email
                                </Text>

                                <Text style={styles.value}>
                                    {carDriver?.email || "-"}
                                </Text>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.label}>
                                    Phone
                                </Text>

                                <Text style={styles.value}>
                                    {carDriver?.mobileno || "-"}
                                </Text>
                            </View>

                        </View>

                        {/* ADDRESS + FIELD */}
                        <View style={styles.row}>

                            <View style={styles.column}>
                                <Text style={styles.label}>
                                    Address
                                </Text>

                                <Text style={styles.value}>
                                    {carDriver?.address || "-"}
                                </Text>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.label}>
                                    Field
                                </Text>

                                <Text style={styles.value}>
                                    {carDriver?.field || "-"}
                                </Text>
                            </View>

                        </View>

                    </View>

                    {/* STATUS BUTTONS */}
                    <View style={styles.buttonContainer}>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() =>
                                openStatusModal("SUSPEND")
                            }
                        >
                            <Text style={styles.buttonText}>
                                SUSPEND
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() =>
                                openStatusModal("BLOCK")
                            }
                        >
                            <Text style={styles.buttonText}>
                                BLOCK
                            </Text>
                        </TouchableOpacity>

                    </View>

                </ScrollView>

            </View>

            {/* STATUS MODAL */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>

                    <View style={styles.modalContainer}>

                        {/* TITLE */}
                        <Text style={styles.modalTitle}>
                            {modalType === "SUSPEND"
                                ? "Suspend Partner"
                                : "Block Partner"}
                        </Text>

                        {/* STATUS */}
                        <Text style={styles.inputLabel}>
                            Status
                        </Text>

                        <View style={styles.statusBox}>
                            <Text style={styles.statusText}>
                                {userInput.status}
                            </Text>
                        </View>

                        {/* SUSPENDED DATE */}
                        {modalType === "SUSPEND" && (
                            <>
                                <Text style={styles.inputLabel}>
                                    Suspended Until
                                </Text>

                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() =>
                                        setDatePickerOpen(true)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.dateText,
                                            !userInput.suspended_until &&
                                            styles.placeholderText,
                                        ]}
                                    >
                                        {formatDisplayDate(
                                            userInput.suspended_until
                                        )}
                                    </Text>
                                </TouchableOpacity>

                                <DatePicker
                                    modal
                                    open={datePickerOpen}
                                    date={
                                        userInput.suspended_until
                                            ? new Date(
                                                userInput.suspended_until
                                            )
                                            : new Date()
                                    }
                                    mode="date"
                                    minimumDate={new Date()}
                                    onConfirm={(selectedDate) => {

                                        setDatePickerOpen(false);

                                        const isoDate =
                                            selectedDate.toISOString();

                                        setUserInput(
                                            (previous: any) => ({
                                                ...previous,
                                                suspended_until:
                                                    isoDate,
                                            })
                                        );
                                    }}
                                    onCancel={() => {
                                        setDatePickerOpen(false);
                                    }}
                                />
                            </>
                        )}

                        {/* REASON */}
                        <Text style={styles.inputLabel}>
                            Reason
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.reasonInput,
                            ]}
                            placeholder="Enter reason"
                            placeholderTextColor="#999"
                            multiline
                            value={userInput.reason}
                            onChangeText={(text) =>
                                setUserInput(
                                    (previous: any) => ({
                                        ...previous,
                                        reason: text,
                                    })
                                )
                            }
                        />

                        {/* MODAL BUTTONS */}
                        <View style={styles.modalButtons}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={closeModal}
                                disabled={loader}
                            >
                                <Text style={styles.cancelText}>
                                    CANCEL
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleUpdateStatus}
                                disabled={loader}
                            >
                                <Text style={styles.submitText}>
                                    {loader
                                        ? "UPDATING..."
                                        : "SUBMIT"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    header: {
        flex: 1,
    },

    content: {
        flex: 9,
        padding: 10,
    },

    title: {
        color: "#000",
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 15,
    },

    card: {
        width: "100%",
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },

    row: {
        flexDirection: "row",
        width: "100%",
        marginBottom: 15,
    },

    column: {
        width: "50%",
        paddingHorizontal: 5,
    },

    label: {
        fontSize: 12,
        color: "#777",
        marginBottom: 4,
    },

    value: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: "500",
    },

    buttonContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 30,
    },

    button: {
        padding: 10,
        backgroundColor: "black",
        width: "40%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },

    buttonText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
    },

    // MODAL

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },

    modalTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
        marginBottom: 20,
    },

    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#555",
        marginBottom: 6,
    },

    statusBox: {
        height: 45,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 12,
        marginBottom: 15,
        backgroundColor: "#f5f5f5",
    },

    statusText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: "600",
    },

    dateInput: {
        height: 45,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 12,
        marginBottom: 15,
        backgroundColor: "#fff",
    },

    dateText: {
        fontSize: 13,
        color: "#000",
    },

    placeholderText: {
        color: "#999",
    },

    input: {
        height: 45,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 13,
        color: "#000",
        marginBottom: 15,
    },

    reasonInput: {
        height: 80,
        textAlignVertical: "top",
        paddingTop: 10,
    },

    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },

    cancelButton: {
        width: "45%",
        height: 45,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#999",
        justifyContent: "center",
        alignItems: "center",
    },

    cancelText: {
        color: "#555",
        fontSize: 12,
        fontWeight: "bold",
    },

    submitButton: {
        width: "45%",
        height: 45,
        borderRadius: 8,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },

    submitText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
});

export default CarDriverDetails;