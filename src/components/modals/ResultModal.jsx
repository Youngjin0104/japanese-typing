import { View, Modal, ScrollView, StyleSheet, Dimensions } from "react-native";
import { C } from "../../styles/colors.js";
import { shadow } from "../../styles/theme.js";

const { height: SH } = Dimensions.get("window");

// ─────────────────────────────────────────────
// 🪟 ResultModal — RN Modal 기반 바텀시트
// ─────────────────────────────────────────────
export default function ResultModal({ visible, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SH * 0.9,
    ...shadow(2),
  },
  handle: {
    width: 40, height: 4, borderRadius: 99,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 12, marginBottom: 4,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
});
