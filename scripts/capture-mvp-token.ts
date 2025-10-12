#!/usr/bin/env tsx
/**
 * Manual MVP Token Capture Tool
 *
 * This script helps you update your Claude Desktop config with a fresh MVP token
 * that you capture manually from your browser's DevTools.
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as readline from "node:readline";

const execAsync = promisify(exec);

interface ClaudeConfig {
  mcpServers?: {
    "activity-reporting"?: {
      command?: string;
      args?: string[];
      env?: {
        MVP_ACCESS_TOKEN?: string;
        MVP_USER_PROFILE_ID?: string;
        ADVOCU_ACCESS_TOKEN?: string;
      };
    };
  };
}

function updateClaudeDesktopConfig(newToken: string): boolean {
  try {
    const configPath = join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");

    let config: ClaudeConfig = {};

    // Read existing config if it exists
    if (existsSync(configPath)) {
      const configContent = readFileSync(configPath, "utf-8");
      config = JSON.parse(configContent);
    }

    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Ensure activity-reporting server exists
    if (!config.mcpServers["activity-reporting"]) {
      config.mcpServers["activity-reporting"] = {
        command: "node",
        args: [join(process.cwd(), "dist", "index.js")],
        env: {},
      };
    }

    // Ensure env object exists
    if (!config.mcpServers["activity-reporting"].env) {
      config.mcpServers["activity-reporting"].env = {};
    }

    // Update the MVP token
    config.mcpServers["activity-reporting"].env.MVP_ACCESS_TOKEN = newToken;

    // Write back to file
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    return true;
  } catch (error) {
    console.error("❌ Error updating config:", error);
    return false;
  }
}

async function main() {
  console.log("\n🔑 MVP Token Manual Capture Tool\n");
  console.log("=" .repeat(60));
  console.log("\n⚠️  IMPORTANTE: Debes estar logueado en el portal MVP ANTES de continuar\n");
  console.log("=" .repeat(60));
  console.log("\n📋 INSTRUCCIONES:\n");
  console.log("1. 🌐 Abriendo tu navegador por defecto en el portal MVP...");
  console.log("2. ✅ Si ya estás logueado, verás tu cuenta directamente");
  console.log("3. 🔐 Si no estás logueado, inicia sesión con tu cuenta Microsoft");
  console.log("\n4. 🛠️  Abre DevTools:");
  console.log("   - Chrome/Edge/Firefox: Presiona F12 o Cmd+Option+I (Mac)");
  console.log("   - Safari: Habilita en Preferencias primero, luego Cmd+Option+I");
  console.log("\n5. 📊 Click en la pestaña 'Network' (Red) en DevTools");
  console.log("6. 📝 Navega a 'Add activity' o edita una actividad existente");
  console.log("7. ✏️  Llena cualquier campo del formulario (esto genera llamadas API)");
  console.log("\n8. 🔍 En la pestaña Network, busca una petición a:");
  console.log("   ✅ 'mavenapi-prod.azurewebsites.net'");
  console.log("   ✅ Método: POST o GET");
  console.log("\n9. 🖱️  Haz click en esa petición");
  console.log("10. 📄 Ve a la pestaña 'Headers' (Encabezados)");
  console.log("11. 📜 Scroll hasta 'Request Headers' (Encabezados de solicitud)");
  console.log("12. 🔑 Encuentra el header 'Authorization'");
  console.log("13. 📋 Copia SOLO la parte del token (después de 'Bearer ')");
  console.log("\n" + "=".repeat(60));
  console.log("\n💡 El token se ve así:");
  console.log("   eyJhbGciOiJSU0EtT0FFUCIsImVuYy...(cadena muy larga)");
  console.log("\n⚠️  IMPORTANTE: Copia SOLO el token, NO la palabra 'Bearer'\n");
  console.log("=".repeat(60) + "\n");

  console.log("⏳ Abriendo navegador en 3 segundos...\n");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Open the default browser
  try {
    await execAsync("open https://mvp.microsoft.com/en-US/account/");
    console.log("✅ Navegador abierto!\n");
  } catch (error) {
    console.log("⚠️  No se pudo abrir el navegador automáticamente");
    console.log("💡 Abre manualmente: https://mvp.microsoft.com/en-US/account/\n");
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("📝 Paste your MVP access token here and press Enter:\n\n", (token) => {
    rl.close();

    const cleanToken = token.trim().replace(/^Bearer\s+/i, "");

    if (!cleanToken || cleanToken.length < 50) {
      console.log("\n❌ Invalid token. Token should be very long (hundreds of characters)");
      console.log("💡 Make sure you copied the entire token");
      process.exit(1);
    }

    console.log("\n✅ Token received!");
    console.log(`📏 Length: ${cleanToken.length} characters`);
    console.log(`🔍 Preview: ${cleanToken.substring(0, 50)}...${cleanToken.substring(cleanToken.length - 20)}\n`);

    console.log("🔧 Updating Claude Desktop config...");
    const updated = updateClaudeDesktopConfig(cleanToken);

    if (updated) {
      console.log("\n✅ SUCCESS! Claude Desktop config updated!");
      console.log("📝 Updated: MVP_ACCESS_TOKEN\n");
      console.log("🔄 Next steps:");
      console.log("   1. Restart Claude Desktop (Cmd+Q then reopen)");
      console.log("   2. Your MVP token is now refreshed and ready to use!\n");
    } else {
      console.log("\n⚠️  Could not auto-update config. Manual update needed:");
      console.log(`   "MVP_ACCESS_TOKEN": "${cleanToken}"\n`);
    }
  });
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
