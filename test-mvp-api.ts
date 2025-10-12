#!/usr/bin/env tsx
/**
 * Test script to debug MVP API submission
 */

import { config } from "dotenv";
config();

const MVP_ACCESS_TOKEN = process.env.MVP_ACCESS_TOKEN;
const MVP_USER_PROFILE_ID = process.env.MVP_USER_PROFILE_ID;

const activity = {
  id: 0,
  activityTypeName: "Video",
  typeName: "Video",
  date: new Date("2025-07-10").toISOString(),
  description:
    "Video tutorial explicando como resolver problemas comunes en Angular 20 y terminar con los dramas de configuracion y migracion. Incluye best practices y soluciones a los desafios mas frecuentes de la version.",
  isPrivate: false,
  targetAudience: ["Developer"],
  tenant: "MVP",
  title: "Como TERMINAR con el drama de Angular 20",
  url: "https://www.youtube.com/watch?v=OXlWMbrGgxk",
  userProfileId: parseInt(MVP_USER_PROFILE_ID!, 10),
  role: "Host",
  technologyFocusArea: "Web Development",
  additionalTechnologyAreas: [],
  liveStreamViews: 0,
  onDemandViews: 8619,
  numberOfSessions: 1,
  inPersonAttendees: 0,
  subscriberBase: 0,
  imageUrl: "",
};

console.log("🔍 Testing MVP API submission...\n");
console.log("📋 Activity data:");
console.log(JSON.stringify(activity, null, 2));
console.log("\n🔑 Token (first 50 chars):", MVP_ACCESS_TOKEN?.substring(0, 50));
console.log("👤 User Profile ID:", MVP_USER_PROFILE_ID);
console.log("\n🌐 Making API call...\n");

async function testMVPAPI() {
  try {
    const url = "https://mavenapi-prod.azurewebsites.net/api/Activities/";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MVP_ACCESS_TOKEN}`,
        Referer: "https://mvp.microsoft.com/",
        Origin: "https://mvp.microsoft.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
      },
      body: JSON.stringify({ activity }),
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    console.log("\n📄 Response headers:");
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const responseText = await response.text();
    console.log("\n📦 Response body:");
    console.log(responseText);

    if (!response.ok) {
      console.log("\n❌ Request failed!");
      if (response.status === 401) {
        console.log("🔐 Authentication error - Token may be expired");
      } else if (response.status === 400) {
        console.log("⚠️  Bad request - Check activity data format");
      }
    } else {
      console.log("\n✅ Request successful!");
      try {
        const json = JSON.parse(responseText);
        console.log("Response JSON:", JSON.stringify(json, null, 2));
      } catch (e) {
        console.log("(Response is not JSON)");
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

testMVPAPI();
