# DTC 477 HTML5 Canvas Game

Welcome to the **DTC 477 HTML5 Canvas Game** GitHub repository!  
Please refer to this document for project organization, collaboration guidelines, and additional information.

---

## 📌 Project Overview

- Our game is a blend between a classical arcade **bullet shooter** and an **M.U.D PC game**, combined with trivia elements.

### 👥 Team Roles
- **Tevin** — Text content, quiz/question arrays  
- **Jackson** — Graphical elements (including style guide)  
- **Gabriel** — Player & enemy movements  

---

## 🎮 Game Structure & Systems

### Game Flow

1. **Start Screen**
   - Title and start button

2. **Debrief Stage**
   - A large text box appears with information about the upcoming question  
   - Player is prompted to continue

3. **Enemy Stage**
   - Player controls a spaceship
   - Must shoot waves of enemies with different behaviors and properties

4. **Boss Stage**
   - Boss appears after enemies are defeated
   - Includes respawning enemies

5. **Loop Progression**
   - After completing the first phase of the boss:
     - Return to Debrief Stage
     - Repeat loop multiple times

### Shared Systems

- Player movement (left/right + shooting)
- Enemy AI
- Boss AI

---

## 📁 Project Organization

- We will follow a **standard GitHub workflow**:
  - Create, clone, and merge branches freely
  - **Discuss major changes before implementing**

### 🔀 Branch Naming Convention

```
dtc477_branchName_lastnameFirstInitial_currentDate[MM/DD/YYYY]
```

**Example:**
```
dtc477_main_murrG_04/02/2026
```

- Adding a short description to commits is encouraged for:
  - Easier review
  - Debugging support

### ⚠️ Workflow Reminders

- Always **fetch/pull before making changes**
- File structure:
  - `/css` → CSS files
  - `/js` → JavaScript files
  - Root → HTML files
- Use **camelCase** for:
  - Function names
  - IDs

---

## ⚙️ Further Mechanic Explanation

### Player

- Movement is **vertically locked**
- Fires at a **slow rate**
- Has a **health bar**
- No lives system (for now)

### Enemies

- Variety encouraged
- Examples:
  - Zigzag movement
  - Projectile-based enemies

---

## 👾 Boss Mechanics

- Appears at the **top of the screen**
- Slowly moves downward
- Fires projectiles intermittently

### Weak Points System

- Boss has **4 weak points**
- Each weak point is **color-coded**

### Trivia Integration

- Question appears at the **bottom of the screen**
- Four possible answers:
  - Randomly assigned colors
  - Colors match boss weak points

### Objective

- Player must shoot the **correct color** to damage the boss

### Additional Mechanics

- Weak point colors **change periodically**
- Hitting the **wrong weak point**:
  - Boss descends faster

---

## 🧠 Debrief System

- Managed by the **text content role**
- Provides a quick overview of the upcoming question
- Uses **randomized arrays** for content selection

---

## 🔁 Level Progression

A full loop:

```
Debrief → Enemy Stage → Boss Stage
```

= **1 Level Completed**

---

## 📎 Notes

- Be communicative with the team
- Keep commits clean and descriptive
- Stay consistent with formatting and structure
