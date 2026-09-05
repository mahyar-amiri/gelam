export type WandSpell = {
    id: number;
    name: string;
    type: string;
    explanation: string;
    svg: {
        viewBox: string;
        path: string;
        gesture: string;
    };
    canonical_scope: string;
    svg_status: string;
};

export const wandSpells: WandSpell[] = [
    {
        "id": 1,
        "name": "Accio",
        "type": "Charm",
        "explanation": "Summoning Charm; pulls a chosen object toward the caster, even from a distance.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 2,
        "name": "Aguamenti",
        "type": "Charm",
        "explanation": "Creates a controlled stream of clean water from the wand.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 3,
        "name": "Alohomora",
        "type": "Charm",
        "explanation": "Unlocks doors and other locked objects unless they have stronger magical protection.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 88 C 28 82, 22 62, 28 44 C 34 26, 66 26, 72 44 C 78 62, 72 82, 50 88 M 38 58 L 62 58",
            "gesture": "Loop-and-close motion suggesting a lock."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 4,
        "name": "Anapneo",
        "type": "Healing spell",
        "explanation": "Clears an obstructed airway so a choking person can breathe again.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 34 62, 40 50 C 46 38, 62 36, 70 46 C 60 44, 50 50, 50 62 C 50 72, 44 80, 50 90",
            "gesture": "Small restorative loop."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 5,
        "name": "Aparecium",
        "type": "Charm",
        "explanation": "Reveals hidden writing such as invisible ink.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 72, 42 64, 30 52 C 42 50, 58 50, 70 52 C 58 64, 50 72, 50 90",
            "gesture": "Open-and-return motion suggesting disclosure."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 6,
        "name": "Avada Kedavra",
        "type": "Curse",
        "explanation": "The Killing Curse; causes immediate death and is one of the three Unforgivable Curses.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 7,
        "name": "Cave Inimicum",
        "type": "Protective charm",
        "explanation": "Creates or reinforces protective magic around an area against enemies or intruders.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 8,
        "name": "Colloportus",
        "type": "Charm",
        "explanation": "Magically seals or locks a door.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 88 C 28 82, 22 62, 28 44 C 34 26, 66 26, 72 44 C 78 62, 72 82, 50 88 M 38 58 L 62 58",
            "gesture": "Loop-and-close motion suggesting a lock."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 9,
        "name": "Confundo",
        "type": "Charm",
        "explanation": "Confuses the target and can make them more susceptible to suggestion.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 20 82, 20 42, 50 34 C 72 28, 78 52, 62 63 C 48 72, 38 60, 44 49 C 50 40, 60 46, 58 54",
            "gesture": "Tight spiral ending at the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 10,
        "name": "Confringo",
        "type": "Curse",
        "explanation": "The Blasting Curse; causes the target to explode or burst violently.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 70, 48 48, 50 24 M 50 52 L 28 36 M 50 52 L 72 36 M 50 52 L 50 18",
            "gesture": "Central thrust with radiating accents."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 11,
        "name": "Crucio",
        "type": "Curse",
        "explanation": "The Cruciatus Curse; inflicts extreme pain and is an Unforgivable Curse.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 72, 38 58, 28 44 M 50 90 C 52 72, 62 58, 72 44 M 50 56 L 50 24",
            "gesture": "Crossing defensive strokes."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 12,
        "name": "Defodio",
        "type": "Charm",
        "explanation": "The Gouging Spell; digs or cuts through solid material such as earth, stone, or metal.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 L 32 68 L 68 54 L 36 36 L 66 18",
            "gesture": "Sharp, energetic zig-zag gesture."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 13,
        "name": "Deletrius",
        "type": "Counter-charm",
        "explanation": "Erases or dispels the magical image produced by Prior Incantato.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 14,
        "name": "Densaugeo",
        "type": "Hex",
        "explanation": "Causes the target's teeth to grow dramatically.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 15,
        "name": "Deprimo",
        "type": "Charm",
        "explanation": "Forces a powerful downward pressure onto the target, capable of breaking or collapsing objects.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 18 C 50 38, 50 55, 50 75 L 50 90",
            "gesture": "Downward stroke or cancellation motion."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 16,
        "name": "Descendo",
        "type": "Charm",
        "explanation": "Forces an object or person downward.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 18 C 50 38, 50 55, 50 75 L 50 90",
            "gesture": "Downward stroke or cancellation motion."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 17,
        "name": "Diffindo",
        "type": "Charm",
        "explanation": "The Severing Charm; cuts or tears an object apart.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 76, 55 62, 72 42 L 84 24",
            "gesture": "Fast rising diagonal slash."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 18,
        "name": "Dissendium",
        "type": "Charm",
        "explanation": "Opens a hidden passage or secret access point; famously used at Hogwarts to open the one-eyed witch passage.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 19,
        "name": "Duro",
        "type": "Transfiguration spell",
        "explanation": "Turns an object into stone or hardens it into a stone-like form.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 20,
        "name": "Engorgio",
        "type": "Charm",
        "explanation": "The Engorgement Charm; enlarges the target.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 21,
        "name": "Episkey",
        "type": "Healing spell",
        "explanation": "Repairs minor physical injuries, such as small cuts or a damaged nose.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 34 62, 40 50 C 46 38, 62 36, 70 46 C 60 44, 50 50, 50 62 C 50 72, 44 80, 50 90",
            "gesture": "Small restorative loop."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 22,
        "name": "Evanesco",
        "type": "Vanishing spell",
        "explanation": "Makes an object disappear.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 23,
        "name": "Expecto Patronum",
        "type": "Charm",
        "explanation": "Conjures a Patronus, a protective magical guardian especially effective against Dementors; a corporeal Patronus can also carry messages.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 24,
        "name": "Expelliarmus",
        "type": "Charm",
        "explanation": "The Disarming Charm; forces an opponent to release what they are holding, especially a wand.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 76, 55 62, 72 42 L 84 24",
            "gesture": "Fast rising diagonal slash."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 25,
        "name": "Expulso",
        "type": "Curse",
        "explanation": "Causes a powerful explosive blast centered on the target.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 70, 48 48, 50 24 M 50 52 L 28 36 M 50 52 L 72 36 M 50 52 L 50 18",
            "gesture": "Central thrust with radiating accents."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 26,
        "name": "Ferula",
        "type": "Charm",
        "explanation": "Conjures bandages and a splint to support an injured body part.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 34 62, 40 50 C 46 38, 62 36, 70 46 C 60 44, 50 50, 50 62 C 50 72, 44 80, 50 90",
            "gesture": "Small restorative loop."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 27,
        "name": "Finite Incantatem",
        "type": "Counter-spell",
        "explanation": "Stops active magical effects or ends the operation of a spell.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 28,
        "name": "Finite",
        "type": "Counter-spell",
        "explanation": "A shorter counter-spell used to end or interrupt magical effects.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 29,
        "name": "Flagrate",
        "type": "Charm",
        "explanation": "Creates fiery marks or glowing symbols with the wand.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 L 32 68 L 68 54 L 36 36 L 66 18",
            "gesture": "Sharp, energetic zig-zag gesture."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 30,
        "name": "Furnunculus",
        "type": "Curse",
        "explanation": "Causes the victim to break out in painful boils.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 70, 48 48, 50 24 M 50 52 L 28 36 M 50 52 L 72 36 M 50 52 L 50 18",
            "gesture": "Central thrust with radiating accents."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 31,
        "name": "Geminio",
        "type": "Charm",
        "explanation": "Creates a duplicate of the target object; magical duplicates can behave differently from the original.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 32,
        "name": "Glisseo",
        "type": "Charm",
        "explanation": "Transforms stairs into a smooth slide.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 33,
        "name": "Homenum Revelio",
        "type": "Revealing charm",
        "explanation": "Reveals the presence of nearby humans.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 72, 42 64, 30 52 C 42 50, 58 50, 70 52 C 58 64, 50 72, 50 90",
            "gesture": "Open-and-return motion suggesting disclosure."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 34,
        "name": "Impedimenta",
        "type": "Jinx",
        "explanation": "The Impediment Jinx slows, stops, or obstructs an approaching target.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 52 76, 45 62, 28 42 L 16 24",
            "gesture": "Fast falling diagonal slash."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 35,
        "name": "Imperio",
        "type": "Curse",
        "explanation": "The Imperius Curse; places the victim under the caster's control and is an Unforgivable Curse.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 20 82, 20 42, 50 34 C 72 28, 78 52, 62 63 C 48 72, 38 60, 44 49 C 50 40, 60 46, 58 54",
            "gesture": "Tight spiral ending at the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 36,
        "name": "Impervius",
        "type": "Charm",
        "explanation": "Makes a surface resistant to water and other liquids.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 37,
        "name": "Incarcerous",
        "type": "Charm",
        "explanation": "Conjures ropes that bind and restrain the target.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 34 80, 28 64, 34 50 C 40 36, 60 36, 66 50 C 72 64, 66 80, 50 90",
            "gesture": "Closing loop around the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 38,
        "name": "Incendio",
        "type": "Charm",
        "explanation": "Produces fire from the wand.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 39,
        "name": "Langlock",
        "type": "Dark charm",
        "explanation": "Glues the target's tongue to the roof of their mouth, preventing normal speech.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 34 80, 28 64, 34 50 C 40 36, 60 36, 66 50 C 72 64, 66 80, 50 90",
            "gesture": "Closing loop around the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 40,
        "name": "Legilimens",
        "type": "Charm",
        "explanation": "Allows the caster to probe a person's mind and access thoughts or memories when successfully performed.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 20 82, 20 42, 50 34 C 72 28, 78 52, 62 63 C 48 72, 38 60, 44 49 C 50 40, 60 46, 58 54",
            "gesture": "Tight spiral ending at the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 41,
        "name": "Levicorpus",
        "type": "Jinx",
        "explanation": "Hoists the target into the air by one ankle, leaving them hanging upside down.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 18 C 50 38, 50 55, 50 75 L 50 90",
            "gesture": "Downward stroke or cancellation motion."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 42,
        "name": "Liberacorpus",
        "type": "Counter-jinx",
        "explanation": "Releases a target from the Levicorpus effect.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 35 C 50 28, 50 22, 50 18",
            "gesture": "Straight rising lift."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 43,
        "name": "Locomotor",
        "type": "Charm",
        "explanation": "Causes an object to move or travel under the caster's control.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 44,
        "name": "Locomotor Mortis",
        "type": "Curse",
        "explanation": "The Leg-Locker Curse; locks the target's legs together so they cannot walk normally.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 34 80, 28 64, 34 50 C 40 36, 60 36, 66 50 C 72 64, 66 80, 50 90",
            "gesture": "Closing loop around the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 45,
        "name": "Lumos",
        "type": "Charm",
        "explanation": "The Wand-Lighting Charm; creates light at the tip of the wand.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 46,
        "name": "Meteolojinx Recanto",
        "type": "Counter-charm",
        "explanation": "Cancels the effects of magical weather manipulation.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 47,
        "name": "Mobiliarbus",
        "type": "Charm",
        "explanation": "Moves a plant or wooden object through the air.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 48,
        "name": "Mobilicorpus",
        "type": "Charm",
        "explanation": "Moves a person's body through the air or from one place to another.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 49,
        "name": "Morsmordre",
        "type": "Dark spell",
        "explanation": "Conjures the Dark Mark in the sky.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 50,
        "name": "Muffliato",
        "type": "Charm",
        "explanation": "Creates an indistinct buzzing around nearby people so conversations cannot easily be overheard.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 51,
        "name": "Nox",
        "type": "Counter-charm",
        "explanation": "Extinguishes the light created by Lumos.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 52,
        "name": "Obliviate",
        "type": "Charm",
        "explanation": "The Memory Charm; removes or alters memories.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 53,
        "name": "Obscuro",
        "type": "Charm",
        "explanation": "Conjures a magical blindfold or covering over the target's eyes.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 72, 42 64, 30 52 C 42 50, 58 50, 70 52 C 58 64, 50 72, 50 90",
            "gesture": "Open-and-return motion suggesting disclosure."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 54,
        "name": "Oppugno",
        "type": "Charm",
        "explanation": "Directs conjured or nearby objects, famously small birds, to attack a target.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 70, 48 48, 50 24 M 50 52 L 28 36 M 50 52 L 72 36 M 50 52 L 50 18",
            "gesture": "Central thrust with radiating accents."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 55,
        "name": "Orchideous",
        "type": "Conjuration",
        "explanation": "Conjures a bouquet of flowers from the wand.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 56,
        "name": "Peskipiksi Pesternomi",
        "type": "Counter-charm",
        "explanation": "A Lockhart attempt at a spell for dealing with pixies; it is portrayed as ineffective.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 L 32 68 L 68 54 L 36 36 L 66 18",
            "gesture": "Sharp, energetic zig-zag gesture."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 57,
        "name": "Petrificus Totalus",
        "type": "Curse",
        "explanation": "The Full Body-Bind Curse; completely immobilizes the target while leaving them conscious.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 34 80, 28 64, 34 50 C 40 36, 60 36, 66 50 C 72 64, 66 80, 50 90",
            "gesture": "Closing loop around the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 58,
        "name": "Piertotum Locomotor",
        "type": "Transfiguration charm",
        "explanation": "Animates statues or suits of armor so they can move and fight under magical command.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 59,
        "name": "Point Me",
        "type": "Charm",
        "explanation": "The Four-Point Spell; causes the wand to act like a compass and point north.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 60,
        "name": "Portus",
        "type": "Charm",
        "explanation": "Turns an object into a Portkey that can transport users to a chosen destination.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 61,
        "name": "Prior Incantato",
        "type": "Charm",
        "explanation": "Forces a wand to reveal the most recent spell it cast.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 72, 42 64, 30 52 C 42 50, 58 50, 70 52 C 58 64, 50 72, 50 90",
            "gesture": "Open-and-return motion suggesting disclosure."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 62,
        "name": "Priori Incantatem",
        "type": "Magical phenomenon",
        "explanation": "A rare reverse-spell effect associated with twin wand cores, forcing a wand to reproduce echoes of its prior spells.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 20 82, 20 42, 50 34 C 72 28, 78 52, 62 63 C 48 72, 38 60, 44 49 C 50 40, 60 46, 58 54",
            "gesture": "Tight spiral ending at the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 63,
        "name": "Protego",
        "type": "Charm",
        "explanation": "The Shield Charm; creates magical protection that can block, weaken, or deflect attacks.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 64,
        "name": "Protego Horribilis",
        "type": "Charm",
        "explanation": "A powerful shield used to protect an area from dark magic.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 72, 38 58, 28 44 M 50 90 C 52 72, 62 58, 72 44 M 50 56 L 50 24",
            "gesture": "Crossing defensive strokes."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 65,
        "name": "Protego Totalum",
        "type": "Charm",
        "explanation": "Extends protective magic over a larger area or group.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 66,
        "name": "Quietus",
        "type": "Counter-charm",
        "explanation": "Cancels Sonorus and returns an amplified voice to normal volume.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 18 C 50 38, 50 55, 50 75 L 50 90",
            "gesture": "Downward stroke or cancellation motion."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 67,
        "name": "Reducio",
        "type": "Counter-charm",
        "explanation": "Counters an enlargement effect by reducing an enlarged object or creature.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 68,
        "name": "Reducto",
        "type": "Curse",
        "explanation": "The Reductor Curse; blasts apart or breaks solid objects.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 52 76, 45 62, 28 42 L 16 24",
            "gesture": "Fast falling diagonal slash."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 69,
        "name": "Relashio",
        "type": "Jinx",
        "explanation": "Forces something to release its grip or breaks a restraint.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 76, 55 62, 72 42 L 84 24",
            "gesture": "Fast rising diagonal slash."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 70,
        "name": "Rennervate",
        "type": "Healing charm",
        "explanation": "Revives or wakes a stunned or unconscious person.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 34 62, 40 50 C 46 38, 62 36, 70 46 C 60 44, 50 50, 50 62 C 50 72, 44 80, 50 90",
            "gesture": "Small restorative loop."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 71,
        "name": "Reparo",
        "type": "Charm",
        "explanation": "Repairs a broken object.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 72,
        "name": "Repello Muggletum",
        "type": "Charm",
        "explanation": "Repels or discourages Muggles from entering or noticing a protected area.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 25 82, 20 52, 34 30 C 48 10, 78 18, 82 44 C 86 69, 66 88, 50 90",
            "gesture": "Continuous protective/ritual circle."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 73,
        "name": "Rictusempra",
        "type": "Charm",
        "explanation": "The Tickling Charm; causes intense tickling and involuntary laughter.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 L 32 68 L 68 54 L 36 36 L 66 18",
            "gesture": "Sharp, energetic zig-zag gesture."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 74,
        "name": "Riddikulus",
        "type": "Charm",
        "explanation": "Transforms a Boggart into something humorous, weakening its ability to inspire fear.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 75,
        "name": "Salvio Hexia",
        "type": "Protective charm",
        "explanation": "Provides additional protection against hostile magical effects, often as part of layered defenses.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 72, 38 58, 28 44 M 50 90 C 52 72, 62 58, 72 44 M 50 56 L 50 24",
            "gesture": "Crossing defensive strokes."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 76,
        "name": "Scourgify",
        "type": "Charm",
        "explanation": "Cleans dirt, grime, and unwanted material from a surface or object.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 77,
        "name": "Sectumsempra",
        "type": "Curse",
        "explanation": "Inflicts deep, slashing wounds as though the target has been cut by an invisible blade.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 76, 55 62, 72 42 L 84 24",
            "gesture": "Fast rising diagonal slash."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 78,
        "name": "Serpensortia",
        "type": "Transfiguration spell",
        "explanation": "Conjures a large snake from the wand.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 20 82, 20 42, 50 34 C 72 28, 78 52, 62 63 C 48 72, 38 60, 44 49 C 50 40, 60 46, 58 54",
            "gesture": "Tight spiral ending at the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 79,
        "name": "Silencio",
        "type": "Charm",
        "explanation": "Silences the target so they cannot make audible sounds.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 18 C 50 38, 50 55, 50 75 L 50 90",
            "gesture": "Downward stroke or cancellation motion."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 80,
        "name": "Sonorus",
        "type": "Charm",
        "explanation": "Magnifies the caster's voice to a much greater volume.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 70, 48 48, 50 24 M 50 52 L 28 36 M 50 52 L 72 36 M 50 52 L 50 18",
            "gesture": "Central thrust with radiating accents."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 81,
        "name": "Specialis Revelio",
        "type": "Revealing charm",
        "explanation": "Reveals the magical properties or enchantments affecting an object.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 72, 42 64, 30 52 C 42 50, 58 50, 70 52 C 58 64, 50 72, 50 90",
            "gesture": "Open-and-return motion suggesting disclosure."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 82,
        "name": "Stupefy",
        "type": "Charm",
        "explanation": "The Stunning Spell; knocks the target unconscious or incapacitates them.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 50 75, 50 55, 50 30 L 50 18",
            "gesture": "Straight thrust toward the target."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 83,
        "name": "Tarantallegra",
        "type": "Jinx",
        "explanation": "Forces the victim's legs to dance uncontrollably.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 L 32 68 L 68 54 L 36 36 L 66 18",
            "gesture": "Sharp, energetic zig-zag gesture."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 84,
        "name": "Tergeo",
        "type": "Charm",
        "explanation": "Cleans or siphons away liquid, dirt, or residue from a surface.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 38 78, 28 64, 24 48 C 40 55, 62 48, 78 28",
            "gesture": "Broad guiding sweep from center outward."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 85,
        "name": "Waddiwasi",
        "type": "Jinx",
        "explanation": "Propels a small object at high speed toward a target.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 48 76, 55 62, 72 42 L 84 24",
            "gesture": "Fast rising diagonal slash."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    },
    {
        "id": 86,
        "name": "Wingardium Leviosa",
        "type": "Charm",
        "explanation": "The Levitation Charm; makes an object rise and move through the air under magical control.",
        "svg": {
            "viewBox": "0 0 100 100",
            "path": "M 50 90 C 22 76, 20 44, 50 22 C 80 44, 78 76, 50 90",
            "gesture": "Smooth semicircular flourish."
        },
        "canonical_scope": "Harry Potter novels 1–7; explicit incantations listed as actively cast spells",
        "svg_status": "Custom UI gesture path; not an official Wizarding World/Rowlings prop or canonical wand-motion specification."
    }
];
