import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SecureStoreModel from "../constants/SecureStoreModel";
import Yearbtn from "../components/Yearbtn";
import ChipNav from "../components/ChipNav";
import DiaryList from "../components/DiaryList";
import { getAllDiaries } from "../constants/Database";
import { DContexts } from "../contexts/DContexts";
import { useState, useEffect, useContext } from "react";
import NoResultComponent from "../components/NoResultComponent";
import useStyles from "../constants/styles";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const date = new Date();
  const monthIndex = date.getMonth();
  const css = useStyles();
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = monthNames[monthIndex];
  const currentMonthIndex = monthNames.indexOf(monthName);

  const rearrangedMonths = [
    ...monthNames.slice(currentMonthIndex),
    ...monthNames.slice(0, currentMonthIndex),
  ];

  const currentYear = date.getFullYear();
  const pastTenYears = [];
  for (let i = 0; i < 10; i++) {
    pastTenYears.push(currentYear - i);
  }

  const [yearfilter, setyearfilter] = useState(currentYear);
  const [monthfilter, setmonthfilter] = useState(monthName);
  const [diaries, setDiaries] = useState([]);
  const { changedsomething } = useContext(DContexts);
  const { primarycolor } = useContext(DContexts);
  const { myuname } = useContext(DContexts);
  const { bgcolor } = useContext(DContexts);
  const { setbgColor, setCardColor, settxtColor } = useContext(DContexts);
  const [lightmode, setLightMode] = useState(bgcolor === "#f5f5f5");

  useEffect(() => {
    getAllDiaries(yearfilter, monthfilter)
      .then((diary) => {
        setDiaries(diary);
      })
      .catch((error) => {
        console.error("Failed to get diaries:", error);
      });
  }, [yearfilter, monthfilter, changedsomething]);

  const changeTheme = () => {
    const newBgColor = lightmode ? "#15202B" : "#f5f5f5";
    const newCardColor = lightmode ? "#273340" : "white";
    const newTextColor = lightmode ? "white" : "black";

    const adjustedBgColor = lightmode ? "#1c2b3c" : "#f5f5f5"; // Adjusted colors for better contrast

    setbgColor(adjustedBgColor);
    setCardColor(newCardColor);
    settxtColor(newTextColor);

    setLightMode(!lightmode);

    // Save updated colors
    SecureStoreModel.saveItem("bgcolor", adjustedBgColor);
    SecureStoreModel.saveItem("cardcolor", newCardColor);
    SecureStoreModel.saveItem("textcolor", newTextColor);
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor={primarycolor}
        barStyle="light-content"
      />
      <ScrollView style={css.container}>
      <View style={[styles.topnav]}>
          <View style={styles.topnavuname}>
          <Text style={{ ...styles.tpn2, ...css.txt }}>{myuname}</Text>
          </View>
          {lightmode ? (
            <TouchableOpacity
              onPress={changeTheme}
              style={[
                styles.themeToggle,
                {
                  backgroundColor: lightmode
                    ? "rgba(21, 32, 43, 0.1)"
                    : "rgba(255, 255, 255, 0.4)",
                },
              ]}
            >
              <Ionicons
                name="moon-outline"
                style={styles.icon}
                color={primarycolor}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={changeTheme}
              style={[
                styles.themeToggle,
                {
                  backgroundColor: lightmode
                    ? "rgba(21, 32, 43, 0.1)"
                    : "rgba(255, 255, 255, 0.4)",
                },
              ]}
            >
              <Ionicons
                name="sunny"
                style={styles.icon}
                color={primarycolor}
              />
            </TouchableOpacity>
          )}
        </View>


        <Dashboard />

        <View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: "row" }}
            horizontal={true}
          >
            <View style={{ marginLeft: 15 }}></View>
            {pastTenYears.map((year) => (
              <TouchableOpacity onPress={() => setyearfilter(year)} key={year}>
                <Yearbtn year={year} active={year === yearfilter} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: "row" }}
            horizontal={true}
          >
            <View style={{ marginLeft: 15 }}></View>
            {rearrangedMonths.map((month) => (
              <TouchableOpacity
                key={month}
                onPress={() => setmonthfilter(month)}
              >
                <ChipNav name={month} active={month === monthfilter} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {diaries.length > 0 ? (
          diaries.map((diary, index) => (
            <DiaryList
              key={diary.id || index}
              id={diary.id}
              title={diary.title}
              timestamp={diary.timestamp}
              data={diary}
            />
          ))
        ) : (
          <NoResultComponent />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  topnav: {
    padding: 10,
    borderRadius: 10,
    margin: 10,
    marginTop: 30,
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topnavuname: {
    flex: 1, // Ensures spacing between username and toggle
  },
  themeToggle: {
    borderRadius: 20, // Curved ends
    padding: 10, // Padding inside the button
    alignItems: "center", // Center the icon
    justifyContent: "center", // Center the icon
  }, 
  icon: {
    fontSize: 25,
  },

  tpn2: {
    fontSize: 24,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
