Welcome to the DTC 477 HTML5 Canvas Game - GitHub repository!
Please refer to this document for project organization and collaboration guidelines, as well as additional information.

!!!Project Overview:

  - Our game is a blend between a classical arcade bullet shooter and an M.U.D PC game, with a blend of trivia. 

  - The roles of the team members are:

    Tevin: Text content, quiz/question arrays

    Jackson: Graphical elements (including style guide)

    Gabriel: Player & enemy movements

!!!Game Structure & Systems:

  - The game flow will go as follows:

    * Start Screen with the title and start button
    * Debreef Stage: A large text box will appear with information relating to the upcoming question, and then the player is prompted to continue to the game
    * Enemy Stage: The player takes control of a spaceship and has to shoot at waves of enemies. They will all have different properties and behaviors.
    * Boss Stage: After the enemies are killed, a boss appears (and a couple of respawning enemies).
    * Once completing the first stage of the boss, the player returns to the debreefing stage, and continues the loop several more times.

  - Shared logic structures include the player movement (which includes left + right directions and shooting), the enemy "AI", and boss "AI".

!!!Project Organization:

  - For this repository, we will be using the basic GitHub workflow for setting up the different branches of the project. You'll have access to create, clone, and merge any branches freely, but I highly encourage you to discuss any major actions with the rest of the group first.
  
  - When pushing, please follow this formula...

      dtc477_branchName_lastnameFirstInitial_currentDate[MM/DD/YYYY]
    
      Ex: dtc477_main_murrG_04/02/2026
    
      While not necessary, a short description of the pushes you make would be helpful for quickly reviewing the changes and could even assist with debugging.

  - Just a reminder to always fetch/pull first before making any changes to the code, even if you don't push it.

  - The files are already organized, so don't worry about that. CSS goes with the CSS folder, and JS goes in JS folder. HTML stays outside in the repository folder.

  - When naming functions or ID's in the code, use camelCase (first word is lowercase, every following word starts with Uppercase)

!!!Further Mechanic Explanation:

  - The players movement is vertically locked. They can only fire at a slow rate. Their will be a health bar, but no lives system (for now)

  - Enemies can come in a variety, and are open to any ideas. Basics would include zigzag pathways, and ones with projectiles.

  - Here is how the boss will function:

    * On start of boss stage, it will appear at the top of the screen.
    * It will slowly make its way down, sparsely sending out projectiles.
    * On it will be 4 weak points (each of which is color coded)
    * The question will be displayed at the bottom of the screen, and below that will be 4 possible answers, each of which is rando,ly set to one of 4 colors (corresponding with the weak points).
    * The players goal is to shoot the correct color to damage the boss.
    * Weak point colors switch after a couple seconds to add challenge.
    * If the player hits the wrong stop, the boss drops down faster.

  - The debreef will be handled by the text content person. It will be a quick overview of the up coming question. This means we will have some randomization involved in what arrays are picked when starting a level.

  - After a full loop is completed (debreef -> boss), that counts towards a single level.
