// ==UserScript==
// @name         Embervale Bounty Analyzer
// @namespace    https://embervale.tv/
// @version      3.0.0
// @description  Compact bounty overlay with badges, best/side-quest dual highlights, draggable & minimizable UI
// @updateURL    https://tanujmalkani.github.io/embervale-userscripts/embervale-bounty.user.js
// @downloadURL  https://tanujmalkani.github.io/embervale-userscripts/embervale-bounty.user.js
// @match        https://embervale.tv/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* =========================
     HELPERS
  ========================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/[_\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* =========================
     MONSTER → TYPE MAP
     (PASTE AUTO-GENERATED MAP HERE)
  ========================= */
  const MONSTER_TYPE_MAP = {
        "abnormous tick": "Insect",
        "abyss wing": "Abomination",
        "accursed captain hawk": "Undead",
        "acid elemental": "Elemental",
        "aiming dwarf": "Humanoid",
        "alpha orc": "Humanoid",
        "angry chicken": "Beast",
        "angry snowman": "Elemental",
        "ankailin the tempter": "Fiend",
        "ant knight": "Insect",
        "ant lion": "Abomination",
        "arcane slime": "Slime",
        "arcane tree": "Plant",
        "ascended duelist": "Humanoid",
        "ascended enforcer": "Humanoid",
        "ascended gatekeeper zephon": "Humanoid",
        "ascended guardian": "Humanoid",
        "ascended sharpshooter": "Humanoid",
        "avian elephant": "Beast",
        "awakened sand": "Elemental",
        "baphomet lord of traitors": "Fiend",
        "barbarian slime": "Slime",
        "basilisk": "Abomination",
        "beach pelican": "Beast",
        "beach spore": "Elemental",
        "bee": "Insect",
        "beetbunny": "Abomination",
        "behemoth": "Abomination",
        "bell pepper lizard": "Beast",
        "berserker dwarf": "Humanoid",
        "betafish": "Aquatic",
        "big sack goblin": "Beast",
        "bighorn": "Beast",
        "biofish": "Aquatic",
        "black ant berserker": "Insect",
        "black ant knight": "Insect",
        "black ant mage": "Insect",
        "black ant protector": "Insect",
        "black ant ranger": "Insect",
        "black dragon": "Dragon",
        "black lance knight": "Humanoid",
        "black roc": "Beast",
        "black wolf": "Beast",
        "blazing shroom": "Plant",
        "blazing spider": "Insect",
        "blessed archer": "Humanoid",
        "blessed spearman": "Humanoid",
        "blessed warrior": "Humanoid",
        "blightflame first of dragons": "Undead",
        "blood orc impaler": "Humanoid",
        "blood orc ravager": "Humanoid",
        "blood orc slaughterer": "Humanoid",
        "bloodstone minotaur": "Beast",
        "blue dragonfly": "Insect",
        "blue slime": "Slime",
        "blue wyvern": "Dragon",
        "bone sharpshooter": "Undead",
        "book mimic": "Mimic",
        "brigand": "Humanoid",
        "brigand skirmisher": "Humanoid",
        "brigand watcher": "Humanoid",
        "brimstone elemental": "Elemental",
        "brown wyvern": "Dragon",
        "bug originator": "Insect",
        "bull dragon": "Dragon",
        "bull lion": "Abomination",
        "burrower": "Insect",
        "bush wisp": "Plant",
        "cactus abomination": "Plant",
        "cape sundew": "Plant",
        "carnivorous plant": "Plant",
        "caterpillar": "Insect",
        "cave dweller worm": "Abomination",
        "cavern hydra": "Dragon",
        "cerberus ptolemaios": "Abomination",
        "cerberus the gate guard": "Abomination",
        "chest mimic": "Mimic",
        "chilling shroom": "Plant",
        "chilling wolf spirit": "Elemental",
        "city watch commander": "Humanoid",
        "city watch gate keeper": "Humanoid",
        "city watch ward": "Humanoid",
        "cockatrice": "Abomination",
        "cold raptor": "Beast",
        "cold ruler": "Elemental",
        "colossal bat": "Beast",
        "colossal black snake": "Beast",
        "colossal dark crow": "Beast",
        "colossal frog": "Aquatic",
        "colossal mummy": "Undead",
        "colossal purple snake": "Beast",
        "colossal red snake": "Beast",
        "colossal scorpion": "Beast",
        "companion of the nameless": "Abomination",
        "competitive dodo": "Beast",
        "consumed hero": "Humanoid",
        "corpse eater ragnar": "Abomination",
        "corrupt executioner": "Humanoid",
        "corrupted forest heart": "Abomination",
        "corrupted rat": "Abomination",
        "corrupted void fire wolf": "Elemental",
        "crag worm": "Abomination",
        "crocoknight": "Humanoid",
        "crocomage": "Humanoid",
        "crocopaladin": "Humanoid",
        "crocorogue": "Humanoid",
        "crystal mimic": "Mimic",
        "crystalback": "Beast",
        "cultist caller": "Abomination",
        "cursed scimitar": "Mimic",
        "dagger shark": "Aquatic",
        "dark elf healer": "Humanoid",
        "dark ruler of the wastelands": "Humanoid",
        "darkness behemoth": "Abomination",
        "darkness crawler azrkoth": "Abomination",
        "darkness fox": "Elemental",
        "darkness gargoyle": "Construct",
        "darkness imp": "Abomination",
        "darkness raptor": "Beast",
        "darkness seeker": "Elemental",
        "darkness wisp": "Elemental",
        "death worm": "Insect",
        "deep naga warrior": "Humanoid",
        "deepwater berserk": "Aquatic",
        "deepwater crab": "Aquatic",
        "deepwater crab warrior": "Aquatic",
        "deepwater dark star": "Aquatic",
        "deepwater lurker": "Aquatic",
        "deepwater urchin": "Aquatic",
        "deepwater watcher": "Aquatic",
        "demon crawler": "Fiend",
        "demon critter fox": "Beast",
        "demon critter rabbit": "Beast",
        "demon critter squirrel": "Beast",
        "demon imp": "Abomination",
        "demon kitsune": "Beast",
        "demon soldier": "Fiend",
        "descended dragon": "Dragon",
        "desert rock lizard": "Beast",
        "desert scorpion": "Beast",
        "devilimp": "Abomination",
        "divine judge vretiel": "Construct",
        "dragon lamprey": "Dragon",
        "dragon wyrm": "Dragon",
        "dryads archer": "Humanoid",
        "dryads companion": "Plant",
        "dryads mage": "Humanoid",
        "dryads warrior": "Humanoid",
        "dusk root": "Plant",
        "duskwood wolf": "Beast",
        "dwarf captain": "Humanoid",
        "dwarf dragon": "Dragon",
        "earth bull": "Beast",
        "earth dragon": "Dragon",
        "earth horse": "Beast",
        "earth lion": "Plant",
        "earth snake": "Beast",
        "earth turtle": "Elemental",
        "earth wisp": "Elemental",
        "electroctopus": "Aquatic",
        "embervale raptor": "Beast",
        "enchanted ore": "Construct",
        "endrekan warden of the pits": "Fiend",
        "executioner dwarf": "Humanoid",
        "eyehopper": "Insect",
        "fallen dragon knight": "Dragon",
        "fallen great sword": "Humanoid",
        "fallen winged sword": "Humanoid",
        "feathered golem": "Construct",
        "feathered razor": "Elemental",
        "feathered snake": "Abomination",
        "fiery cultist": "Elemental",
        "fire ant": "Insect",
        "fire bull": "Beast",
        "fire dragonspawn": "Dragon",
        "fire lion": "Elemental",
        "fire ogre": "Elemental",
        "fire pumice rock": "Elemental",
        "fire pumice sheep": "Elemental",
        "fire sabretooth": "Beast",
        "fire salamander": "Elemental",
        "fire snake": "Beast",
        "fire toad": "Beast",
        "fire turtle": "Elemental",
        "fire vulture": "Elemental",
        "fire wisp": "Elemental",
        "flame monkey": "Elemental",
        "flame raptor": "Beast",
        "flaming slime": "Slime",
        "flaming wolf": "Elemental",
        "flaming wolf spirit": "Elemental",
        "flightless bird": "Beast",
        "flying chaos": "Abomination",
        "flying leech": "Insect",
        "flying skull": "Undead",
        "forest bee": "Insect",
        "forest blue flower": "Plant",
        "forest catermoth": "Insect",
        "forest darkluff": "Elemental",
        "forest deer": "Beast",
        "forest fairy dragon": "Dragon",
        "forest fox": "Beast",
        "forest ghost": "Undead",
        "forest goblin axe": "Humanoid",
        "forest goblin dagger": "Humanoid",
        "forest goblin sword": "Humanoid",
        "forest golem": "Elemental",
        "forest grasshopper": "Insect",
        "forest green spider": "Insect",
        "forest imperial widow": "Insect",
        "forest mageshroom": "Plant",
        "forest mothy": "Insect",
        "forest panda": "Beast",
        "forest pink flower": "Plant",
        "forest red flower": "Plant",
        "forest red spider": "Insect",
        "forest scorpion": "Insect",
        "forest shroom": "Plant",
        "forest shroomy": "Plant",
        "forest spider": "Insect",
        "forest spora": "Plant",
        "forest sprout": "Plant",
        "forest tree": "Plant",
        "forest turtle": "Beast",
        "forest uzu": "Plant",
        "forest white flower": "Plant",
        "forest wolf": "Beast",
        "forgotten goblin": "Humanoid",
        "forgotten slime": "Slime",
        "fork rat": "Humanoid",
        "fox bandit": "Humanoid",
        "fox crook": "Humanoid",
        "fox rogue": "Humanoid",
        "frost gorilla": "Elemental",
        "frost sickle mantis": "Insect",
        "frost spirit": "Elemental",
        "frost wing": "Insect",
        "frozen invader": "Undead",
        "frozen mantis": "Elemental",
        "frozen robber": "Undead",
        "frozen skirmisher": "Undead",
        "fur wing": "Insect",
        "gargoyle grifos": "Construct",
        "garuda garunix": "Beast",
        "gemstone fire dragon": "Dragon",
        "general gogz": "Humanoid",
        "ghost puppet": "Undead",
        "ghost revelator": "Undead",
        "giant grizzly": "Beast",
        "giant mosquito": "Insect",
        "giant rat": "Beast",
        "giant roach": "Insect",
        "gnoll archer": "Humanoid",
        "gnoll shaman": "Humanoid",
        "gnoll swordsman": "Humanoid",
        "gnoll vanguard": "Humanoid",
        "goblin captain": "Humanoid",
        "goblin fairy": "Humanoid",
        "goblin flag bearer": "Humanoid",
        "goblin grunt": "Humanoid",
        "goblin knight": "Humanoid",
        "goblin mage": "Humanoid",
        "goblin ranger": "Humanoid",
        "goblin reaper": "Humanoid",
        "goblin rider": "Humanoid",
        "goblin rogue": "Humanoid",
        "goblin sorcerer": "Humanoid",
        "god king hubertus iii": "Slime",
        "grandmaster udabras": "Slime",
        "gravekeeper": "Undead",
        "great shark": "Aquatic",
        "greed incarnation": "Construct",
        "green dragonfly": "Insect",
        "green wyvern": "Dragon",
        "grish the hungering": "Fiend",
        "grumpy cactus": "Plant",
        "hag": "Humanoid",
        "haunting ghost": "Undead",
        "headhunter slime": "Slime",
        "headless horseman": "Undead",
        "hell manticore": "Fiend",
        "hell mantis": "Insect",
        "hellhound": "Fiend",
        "hellhound guard": "Fiend",
        "hercules bug": "Insect",
        "heroic slime": "Slime",
        "hooded stranger": "Humanoid",
        "horn willow": "Undead",
        "hornet warrior": "Insect",
        "ice avian": "Beast",
        "ice bull": "Elemental",
        "ice cave bat": "Beast",
        "ice glacier spawn": "Elemental",
        "ice golem": "Elemental",
        "ice kindred glacier": "Elemental",
        "ice lion": "Elemental",
        "ice ogre": "Elemental",
        "ice serpent": "Beast",
        "ice snake": "Beast",
        "ice snow golem": "Construct",
        "ice snowman": "Elemental",
        "ice spike": "Elemental",
        "ice turtle": "Beast",
        "ice wisp": "Elemental",
        "ice wolf": "Beast",
        "ice yeti": "Beast",
        "ignited bat": "Beast",
        "ignithor the charred sovereign": "Undead",
        "infernal duelist": "Humanoid",
        "infernal harpy": "Fiend",
        "infernal spirit": "Elemental",
        "inferno wing": "Insect",
        "infinity": "Abomination",
        "informed rat": "Humanoid",
        "insects dragon": "Dragon",
        "insects swarm": "Insect",
        "intoxicating shroom": "Plant",
        "invader brawler": "Abomination",
        "invader challenger": "Abomination",
        "invader grunt": "Abomination",
        "invader hunter": "Abomination",
        "invader queen": "Abomination",
        "invader raptor": "Abomination",
        "invader stalker": "Abomination",
        "iron minotaur": "Beast",
        "kefkor the tainted": "Fiend",
        "king leonidas": "Beast",
        "knight rose": "Plant",
        "knight spear elite": "Humanoid",
        "knight sword elite": "Humanoid",
        "knights spear common": "Humanoid",
        "knights sword common": "Humanoid",
        "kobold archer": "Humanoid",
        "kobold armor": "Humanoid",
        "kobolds dagger": "Humanoid",
        "kobolds mage": "Humanoid",
        "kobolds spear": "Humanoid",
        "lady of the passage": "Abomination",
        "lady of the vale": "Abomination",
        "lamia": "Humanoid",
        "lava spawn": "Elemental",
        "lava worm": "Insect",
        "leaf imp": "Plant",
        "lich": "Undead",
        "light fox": "Elemental",
        "light slime": "Slime",
        "lion queen melora": "Beast",
        "lion roach": "Abomination",
        "living armor": "Undead",
        "lost fairy": "Elemental",
        "lost soul": "Elemental",
        "loyal wolf": "Beast",
        "lucifer the fallen": "Fiend",
        "lunar wing": "Insect",
        "majestic boar": "Beast",
        "mandrake": "Plant",
        "masked demon giant": "Abomination",
        "melee tree": "Plant",
        "metal golem": "Construct",
        "mind flayer": "Abomination",
        "miner dwarf": "Humanoid",
        "minivolcano": "Elemental",
        "monstrous scarab": "Insect",
        "moonlight hunter": "Beast",
        "mountain behemoth": "Abomination",
        "mountain bunny": "Beast",
        "mountain greathorn goat": "Beast",
        "mountain griffon": "Beast",
        "mountain harpy": "Humanoid",
        "mountain hornet": "Insect",
        "mountain nanjo": "Plant",
        "mountain snail": "Insect",
        "mountain warden": "Beast",
        "mountain warthog": "Beast",
        "mountain winter wolf": "Beast",
        "mountain wolf": "Beast",
        "mushroom knight": "Plant",
        "mutated carnivorous plant": "Plant",
        "mysterious puppy": "Beast",
        "mysterious white mage": "Humanoid",
        "night blade assassin": "Humanoid",
        "night blade commander": "Humanoid",
        "nightmare spider": "Undead",
        "nightmare stalker": "Abomination",
        "novice cultist": "Humanoid",
        "odin": "Humanoid",
        "orc archer": "Humanoid",
        "orc marauder": "Humanoid",
        "orc war drummer": "Humanoid",
        "orc warlock": "Humanoid",
        "orc warrior": "Humanoid",
        "overseer crab": "Aquatic",
        "oversized goblin": "Humanoid",
        "peacock sharpshooter": "Beast",
        "pegasus": "Beast",
        "pirate bandit": "Humanoid",
        "pirate monkey": "Beast",
        "pirate parrot": "Beast",
        "pirate skeleton": "Undead",
        "plague rat": "Beast",
        "plant exotic flyer": "Plant",
        "plant snail": "Insect",
        "poison tongue": "Beast",
        "poisonous slime": "Slime",
        "possessed dwarf": "Humanoid",
        "protector of the forest heart": "Construct",
        "quadruraptor": "Beast",
        "rabbit bandit": "Humanoid",
        "rabbit knight": "Humanoid",
        "rabbit stealth archer": "Beast",
        "radiant knight": "Humanoid",
        "radishrat": "Abomination",
        "raiding knight": "Humanoid",
        "rain wing": "Insect",
        "rat gourmet": "Humanoid",
        "razor tail frog": "Beast",
        "razortail eagle": "Beast",
        "red wyvern": "Dragon",
        "roaming salamander": "Dragon",
        "rock golem": "Elemental",
        "rocktail demolisher": "Elemental",
        "root shield": "Plant",
        "rose warrior": "Plant",
        "royal guard slime": "Slime",
        "rudolph": "Beast",
        "sacred vale guardian": "Elemental",
        "saint of the cold crux": "Abomination",
        "sand caterpillar": "Insect",
        "sand devourer": "Elemental",
        "sand snake": "Beast",
        "sand tentacle": "Plant",
        "sand wing": "Insect",
        "scavenging mandrake": "Plant",
        "sea abismos": "Aquatic",
        "sea blue dragon": "Aquatic",
        "sea crab": "Aquatic",
        "sea fatoad": "Aquatic",
        "sea fish": "Aquatic",
        "sea horse": "Aquatic",
        "sea jellyfish": "Aquatic",
        "sea lickitoad": "Aquatic",
        "sea lurker": "Slime",
        "sea octi": "Aquatic",
        "sea octopus": "Aquatic",
        "sea piranos": "Aquatic",
        "sea shark": "Aquatic",
        "sea shelltacke": "Aquatic",
        "sea spheria": "Aquatic",
        "sea star trio": "Aquatic",
        "sea tortoad": "Aquatic",
        "sea turtle": "Aquatic",
        "seagull": "Beast",
        "shadow beast": "Abomination",
        "shadow creature": "Abomination",
        "shadow invocation knight": "Undead",
        "shark bow": "Aquatic",
        "shark frog": "Abomination",
        "shimmering dragon": "Dragon",
        "sickle mantis": "Insect",
        "silver avian": "Beast",
        "silvershield": "Humanoid",
        "siren": "Aquatic",
        "skeleton archer": "Undead",
        "skeleton commander": "Undead",
        "skeleton cutthroat": "Undead",
        "skeleton dragon": "Dragon",
        "skeleton guard": "Undead",
        "skeleton hare": "Beast",
        "skeleton knight": "Undead",
        "skeleton mage": "Undead",
        "skeleton mage mabon": "Undead",
        "skeleton marauder": "Undead",
        "skull fish": "Aquatic",
        "slime earthi": "Slime",
        "slime protector": "Slime",
        "slime scout": "Slime",
        "slime wizard": "Slime",
        "snow golem": "Construct",
        "snowball": "Construct",
        "sorceress": "Humanoid",
        "sphinx": "Abomination",
        "spider crab": "Aquatic",
        "spike hopper": "Insect",
        "spiked caterpillar": "Insect",
        "spiky turtle": "Aquatic",
        "spirit ape": "Beast",
        "spirit baboon": "Beast",
        "spirit boar": "Beast",
        "spirit fox": "Beast",
        "spirit owl": "Beast",
        "spirit panda": "Beast",
        "spirit primate": "Beast",
        "spirit tiger": "Beast",
        "spirit wolf": "Beast",
        "squirrel defender": "Humanoid",
        "squirrel mage": "Humanoid",
        "squirrel warrior": "Humanoid",
        "star shell": "Aquatic",
        "stone knight alpha": "Construct",
        "stone knight beta": "Construct",
        "stone knight zeta": "Construct",
        "storm hawk": "Elemental",
        "succubus archer": "Fiend",
        "temengoth the many headed": "Fiend",
        "the captain": "Humanoid",
        "the deep one": "Abomination",
        "the kraken": "Aquatic",
        "the nameless": "Undead",
        "the sacrificed": "Elemental",
        "the tormented": "Fiend",
        "thorn cutter": "Plant",
        "tiger dragon": "Dragon",
        "toucan panther": "Beast",
        "toxic carnivorous plant": "Plant",
        "toxic frog": "Beast",
        "toxic horned frog": "Beast",
        "toxic root": "Plant",
        "toxic root mutation": "Plant",
        "toxic spreader": "Plant",
        "toxic white frog": "Beast",
        "tree magical": "Plant",
        "tree skirmisher": "Plant",
        "tridentpupa": "Insect",
        "tulip wing": "Insect",
        "turtle golem": "Construct",
        "twin snow golem": "Construct",
        "two headed turtle": "Abomination",
        "unarmed kobold": "Humanoid",
        "undead axe": "Undead",
        "undead blade": "Undead",
        "undead claw knight": "Undead",
        "undead eastern archer": "Undead",
        "undead eastern marauder": "Undead",
        "undead eastern plunderer": "Undead",
        "undead gnoll": "Undead",
        "undead jiangshi": "Undead",
        "undead longshot": "Undead",
        "underworld maw": "Abomination",
        "unifrog": "Beast",
        "vakan the wretched": "Fiend",
        "vale drake": "Dragon",
        "vampire lord": "Humanoid",
        "venomous centipede": "Insect",
        "void fox": "Elemental",
        "void gargoyle": "Construct",
        "voidoll erabos": "Construct",
        "voidoll erebia": "Construct",
        "voidoll erebus": "Construct",
        "volcanic golem": "Construct",
        "volcanic maiden": "Humanoid",
        "wall mimic": "Mimic",
        "waterstrider": "Insect",
        "werewolf": "Beast",
        "white minotaur": "Beast",
        "wind avian": "Elemental",
        "wind bunny": "Beast",
        "wind harpy": "Humanoid",
        "wind lion": "Beast",
        "wind mantis": "Insect",
        "wind snake": "Beast",
        "wind spawn": "Elemental",
        "wind wisp": "Elemental",
        "wood golem": "Elemental",
        "wooden doll berserk": "Construct",
        "wooden doll ranger": "Construct",
        "wooden doll warrior": "Construct",
        "wyvern bat": "Dragon",
        "xandor the schemer": "Fiend",
        "yeti wisp": "Elemental",
        "zombie forest flower": "Undead",
    };

  /* =========================
     STORAGE KEYS
  ========================= */
  const LS = {
    sort: 'ev_sort',
    sideEnabled: 'ev_side_enabled',
    sideClass: 'ev_side_class',
    sideStars: 'ev_side_stars',
    sideType: 'ev_side_type',
    posX: 'ev_overlay_x',
    posY: 'ev_overlay_y',
    minimized: 'ev_overlay_min'
  };

  /* =========================
     PARSE BOUNTIES
  ========================= */
  function parseAllBounties() {
    const results = [];

    $$('.bounty-item').forEach(item => {
      const rawName =
        item.querySelector('.bounty-title span')?.textContent.trim() || 'Unknown';

      const normalized = normalizeName(rawName);
      const type = MONSTER_TYPE_MAP[normalized] || 'Humanoid';

      let bountyClass = null;
      const classImg = item.querySelector('.bounty-class-icon');
      if (classImg?.src) {
        bountyClass = classImg.src.split('/').pop().replace('.webp', '');
      }

      let stars = 0;
      const starBox = $$('.bounty-stat-box-left', item).find(box =>
        box.querySelector('.bounty-stat-icon')
          ?.style.backgroundImage.includes('star.webp')
      );
      if (starBox) {
        stars = parseInt(
          starBox.querySelector('.bounty-stat-value')?.textContent.trim() || '0',
          10
        );
      }

      let xp = 0, stamina = 0;
      $$('.bounty-stat-box-right', item).forEach(box => {
        const val = parseInt(
          box.querySelector('.bounty-stat-value')?.textContent.trim() || '0',
          10
        );
        const icon =
          box.querySelector('.bounty-stat-icon')?.style.backgroundImage || '';
        if (icon.includes('xp.webp')) xp = val;
        if (icon.includes('stamina.webp')) stamina = val;
      });

      let silver = 0, copper = 0;
      $$('img.money-img', item).forEach(img => {
        const v = parseInt(img.nextElementSibling?.textContent.trim() || '0', 10);
        if (img.src.includes('silver.webp')) silver = v;
        if (img.src.includes('copper.webp')) copper = v;
      });

      const coins = silver * 100 + copper;

      results.push({
        name: rawName,
        type,
        class: bountyClass,
        stars,
        xp,
        stamina,
        coins,
        xpPerSta: stamina ? +(xp / stamina).toFixed(2) : Infinity,
        coinsPerSta: stamina ? +(coins / stamina).toFixed(2) : Infinity,
        element: item
      });
    });

    return results;
  }

  /* =========================
     MATCH SIDE QUEST (OR LOGIC)
  ========================= */
  function matchesSideQuest(b) {
    if (localStorage.getItem(LS.sideEnabled) !== 'true') return false;

    const fClass = localStorage.getItem(LS.sideClass) || 'none';
    const fStars = localStorage.getItem(LS.sideStars) || 'none';
    const fType  = localStorage.getItem(LS.sideType)  || 'none';

    if (fClass === 'none' && fStars === 'none' && fType === 'none') return false;

    return (
      (fClass !== 'none' && b.class === fClass) ||
      (fStars !== 'none' && b.stars === Number(fStars)) ||
      (fType  !== 'none' && b.type === fType)
    );
  }

  /* =========================
     PAGE HIGHLIGHTING
  ========================= */
  function clearPageHighlight(b) {
    b.element.style.borderLeft = '';
    b.element.style.outline = '';
    b.element.style.boxShadow = '';
  }

  function applyBestHighlight(b) {
    b.element.style.border = '2px solid gold';
    b.element.style.borderRadius = '10px';
  }

  function applySideHighlight(b) {
      b.element.style.outline = '2px solid #a855f7';
      b.element.style.outlineOffset = '4px'; // <-- key spacing
      b.element.style.boxShadow = '0 0 8px rgba(168,85,247,0.6)';
  }

  /* =========================
     BADGES
  ========================= */
  const BADGE = `
    display:inline-block;
    padding:1px 6px;
    margin-left:4px;
    border-radius:999px;
    font-size:10px;
    background:#2a2a2a;
    border:1px solid #444;
    color:#ddd;
  `;

  function badge(text) {
    return `<span style="${BADGE}">${text}</span>`;
  }

  /* =========================
     OVERLAY
  ========================= */
  let overlay = null;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;
      top:16px;
      right:16px;
      background:rgba(18,18,18,0.9);
      color:#fff;
      font-family:system-ui,sans-serif;
      font-size:11px;
      border-radius:10px;
      padding:8px;
      z-index:999999;
      max-height:80vh;
      overflow:auto;
      min-width:340px;
    `;

    overlay.innerHTML = `
      <div id="ev-header" style="cursor:move;font-weight:700;margin-bottom:6px">
        🗡 Embervale Bounties
      </div>

      <div id="ev-body">
        <div style="text-align:center;margin-bottom:6px">
          <select id="ev-sort">
            <option value="xpPerSta">XP / STA</option>
            <option value="coinsPerSta">Coins / STA</option>
          </select>
        </div>

        <div style="text-align:center;margin-bottom:4px">
          <label>
            <input type="checkbox" id="ev-side-enabled">
            Highlight Side Quest
          </label>
        </div>

        <div id="ev-filters" style="display:none;gap:4px;justify-content:center">
          <select id="ev-side-class">
            <option value="none">Class</option>
            <option>warrior</option>
            <option>knight</option>
            <option>rogue</option>
            <option>ranger</option>
            <option>mage</option>
          </select>

          <select id="ev-side-type">
            <option value="none">Type</option>
            <option>Insect</option>
            <option>Undead</option>
            <option>Dragon</option>
            <option>Aquatic</option>
            <option>Beast</option>
            <option>Humanoid</option>
            <option>Plant</option>
            <option>Slime</option>
            <option>Mimic</option>
            <option>Construct</option>
            <option>Elemental</option>
          </select>

          <select id="ev-side-stars">
            <option value="none">Stars</option>
            <option value="1">★1</option>
            <option value="2">★2</option>
            <option value="3">★3</option>
            <option value="4">★4</option>
            <option value="5">★5</option>
          </select>
        </div>

        <hr style="border-color:#333">

        <div id="ev-list"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    $('#ev-sort').value = localStorage.getItem(LS.sort) || 'xpPerSta';
    $('#ev-side-enabled').checked = localStorage.getItem(LS.sideEnabled) === 'true';
    $('#ev-side-class').value = localStorage.getItem(LS.sideClass) || 'none';
    $('#ev-side-type').value = localStorage.getItem(LS.sideType) || 'none';
    $('#ev-side-stars').value = localStorage.getItem(LS.sideStars) || 'none';

    $('#ev-filters').style.display =
      $('#ev-side-enabled').checked ? 'flex' : 'none';

    overlay.addEventListener('change', refreshOverlay);
    $('#ev-header').onclick = toggleMinimize;

    enableDrag();
  }

  let minimized = localStorage.getItem(LS.minimized) === 'true';

  function toggleMinimize() {
    minimized = !minimized;
    localStorage.setItem(LS.minimized, minimized);
    $('#ev-body').style.display = minimized ? 'none' : 'block';
  }

  /* =========================
     RENDER
  ========================= */
  function refreshOverlay() {
    if (!overlay) return;

    localStorage.setItem(LS.sort, $('#ev-sort').value);
    localStorage.setItem(LS.sideEnabled, $('#ev-side-enabled').checked);
    localStorage.setItem(LS.sideClass, $('#ev-side-class').value);
    localStorage.setItem(LS.sideType, $('#ev-side-type').value);
    localStorage.setItem(LS.sideStars, $('#ev-side-stars').value);

    $('#ev-filters').style.display =
      $('#ev-side-enabled').checked ? 'flex' : 'none';

    const list = $('#ev-list');
    list.innerHTML = '';

    const bounties = parseAllBounties();
    bounties.forEach(clearPageHighlight);

    const sortKey = $('#ev-sort').value;
    bounties.sort((a, b) => b[sortKey] - a[sortKey]);

    const best = bounties[0];
    applyBestHighlight(best);

    bounties.forEach(b => {
      if (matchesSideQuest(b)) applySideHighlight(b);
    });

    bounties.forEach((b, i) => {
      const isBest = b === best;
      const isSide = matchesSideQuest(b);

      const row = document.createElement('div');
      row.style.cssText = `
          padding:4px 6px;
          margin-bottom:4px;
          border-radius:8px;
          border: ${isBest ? '2px solid gold' : '1px solid #333'};
          ${isSide ? 'outline:2px solid #a855f7; outline-offset:3px;' : ''}
        `;

      row.innerHTML = `
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:600">
            ${isBest ? '<span style="color:gold">🥇</span> ' : ''}
            ${b.name}
          </div>
          <div>
            ${badge(b.type)}
            ${badge(b.class)}
            ${badge('★' + b.stars)}
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;color:#ccc">
          <div>XP ${b.xp} | STA ${b.stamina} | 💰 ${b.coins}</div>
          <div>XP/STA ${b.xpPerSta} | C/STA ${b.coinsPerSta}</div>
        </div>
      `;

      row.onclick = () =>
        b.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      list.appendChild(row);
    });
  }

  /* =========================
     DRAG
  ========================= */
  function enableDrag() {
    const h = $('#ev-header');
    let sx, sy, sl, st, drag = false;

    h.onmousedown = e => {
      drag = true;
      sx = e.clientX;
      sy = e.clientY;
      sl = overlay.offsetLeft;
      st = overlay.offsetTop;
      document.body.style.userSelect = 'none';
    };

    document.onmousemove = e => {
      if (!drag) return;
      overlay.style.left = sl + (e.clientX - sx) + 'px';
      overlay.style.top = st + (e.clientY - sy) + 'px';
      overlay.style.right = 'auto';
    };

    document.onmouseup = () => {
      drag = false;
      document.body.style.userSelect = '';
    };
  }

  /* =========================
     LIFECYCLE
  ========================= */
  function updateLifecycle() {
    const board = $('.bounty-board');
    if (board && !overlay) {
      buildOverlay();
      refreshOverlay();
    }
    if (!board && overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  new MutationObserver(updateLifecycle)
    .observe(document.body, { childList: true, subtree: true });

})();
