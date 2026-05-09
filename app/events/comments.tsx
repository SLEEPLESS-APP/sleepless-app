import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  GradientBackground,
  HomeButton,
  BackButton,
  Avatar,
} from "@/components/sleepless";
import { mockComments, type Comment } from "@/data/mock-data";

export default function CommentsScreen() {
  const handleCamera = () => {
    alert("Camera feature coming soon!");
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.commentImage} />
      )}
      <View style={styles.commentOverlay}>
        <View style={styles.userInfo}>
          <Avatar size={30} showBorder={false} />
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="favorite" size={18} color="#ff6b6b" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="chat-bubble" size={18} color="#ffffff" />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Status Input */}
          <View style={styles.statusContainer}>
            <Avatar size={36} showBorder={false} />
            <TextInput
              style={styles.statusInput}
              placeholder="Write a status..."
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          {/* Comments Feed */}
          <FlatList
            data={mockComments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderComment}
          />

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <BackButton />
            <HomeButton />
            <Pressable
              onPress={handleCamera}
              style={({ pressed }) => [styles.cameraButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="camera-alt" size={28} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statusInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 12,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  commentCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    height: 300,
  },
  commentImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  commentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  username: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#ffffff",
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 48,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
