#include <combo.h>

extern void* gMmMag;

static void debugCheat(GameState_Play* play)
{
#if defined(DEBUG)
    if (play->gs.input[0].current.buttons & L_TRIG)
    {
        gSave.inventory[ITS_OOT_STICKS] = ITEM_OOT_STICK;
        gSave.inventory[ITS_OOT_NUTS] = ITEM_OOT_NUT;
        gSave.inventory[ITS_OOT_BOMBS] = ITEM_OOT_BOMB;
        gSave.inventory[ITS_OOT_BOW] = ITEM_OOT_BOW;
        gSave.inventory[ITS_OOT_ARROW_FIRE] = ITEM_OOT_ARROW_FIRE;
        gSave.inventory[ITS_OOT_SLINGSHOT] = ITEM_OOT_SLINGSHOT;
        gSave.inventory[ITS_OOT_OCARINA] = ITEM_OOT_OCARINA_TIME;
        gSave.inventory[ITS_OOT_BOOMERANG] = ITEM_OOT_BOOMERANG;
        gSave.inventory[ITS_OOT_BOTTLE] = ITEM_OOT_RUTO_LETTER;
        gSave.inventory[ITS_OOT_BOTTLE2] = ITEM_OOT_EMPTY_BOTTLE;
        gSave.inventory[ITS_OOT_BOTTLE3] = ITEM_OOT_BIG_POE;
        gSave.inventory[ITS_OOT_BOTTLE4] = ITEM_OOT_BIG_POE;
        gSave.inventory[ITS_OOT_BOMBCHU] = ITEM_OOT_BOMBCHU_10;
        gSave.inventory[ITS_OOT_TRADE_CHILD] = ITEM_OOT_ZELDA_LETTER;
        gSave.inventory[ITS_OOT_HAMMER] = ITEM_OOT_HAMMER;
        gSave.inventory[ITS_OOT_HOOKSHOT] = ITEM_OOT_LONGSHOT;
        gSave.inventory[ITS_OOT_LENS] = ITEM_OOT_LENS;
        gSave.equipment.swords = 0x3;
        gSave.equipment.shields = 0x7;
        gSave.equipment.tunics = 0x7;
        gSave.equipment.boots = 0x7;
        gSave.upgrades.dekuStick = 3;
        gSave.upgrades.bulletBag = 3;
        gSave.upgrades.bombBag = 3;
        gSave.upgrades.quiver = 3;
        gSave.upgrades.dive = 2;
        gSave.upgrades.wallet = 2;
        gSave.ammo[ITS_OOT_STICKS] = 30;
        gSave.ammo[ITS_OOT_SLINGSHOT] = 50;
        gSave.ammo[ITS_OOT_BOMBS] = 40;
        gSave.ammo[ITS_OOT_BOW] = 50;
        gSave.quest.songZelda = 1;
        gSave.quest.songSaria = 1;
        gSave.quest.songTime = 1;
        gSave.quest.songSun = 1;

        gSave.quest.stoneEmerald = 0;
        gSave.quest.stoneRuby = 0;
        gSave.quest.stoneSapphire = 0;

        gMmExtraFlags2.majora = 1;

        //gSave.quest.medallionShadow = 1;
        //gSave.quest.medallionSpirit = 1;
        //gSave.quest.medallionForest = 1;
        //gSave.quest.medallionFire = 1;
        //gSave.quest.medallionWater = 1;
        //gSave.quest.medallionLight = 1;

        gSave.health = gSave.healthMax = 20 * 0x10;

        gSave.rupees = 500;

        gOotExtraTrade.child = 0xffff;
        gOotExtraTrade.adult = 0;
        gOotExtraTrade.adult |= (1 << XITEM_OOT_ADULT_EYEBALL_FROG);
        gOotExtraTrade.adult |= (1 << XITEM_OOT_ADULT_EYE_DROPS);
        gOotExtraTrade.adult |= (1 << XITEM_OOT_ADULT_CLAIM_CHECK);
        gSave.inventory[ITS_OOT_TRADE_ADULT] = ITEM_OOT_EYEBALL_FROG;

#if defined(DEBUG_AGE)
        gSave.age = DEBUG_AGE;
#endif

        BITMAP16_SET(gSave.eventsMisc, EV_OOT_INF_KING_ZORA_THAWED);
    }
#endif
}

static void skipEntranceCutscene(GameState_Play* play)
{
    switch (gSave.entrance)
    {
    case 0x0185:
        SetEventChk(0xa0);
        break;
    case 0x013d:
        SetEventChk(0xa1);
        break;
    case 0x00db:
        SetEventChk(0xa3);
        break;
    case 0x0108:
        SetEventChk(0xa4);
        break;
    case 0x0138:
        if (gSave.age == 1)
            SetEventChk(0xa5);
        else
            SetEventChk(0xba);
        break;
    case 0x014d:
        SetEventChk(0xa6);
        break;
    case 0x0053:
        SetEventChk(0xa7);
        break;
    case 0x0000:
        SetEventChk(0xa8);
        break;
    case 0x0102:
        SetEventChk(0xb1);
        break;
    case 0x0117:
        SetEventChk(0xb2);
        break;
    case 0x0129:
        SetEventChk(0xb3);
        break;
    case 0x0157:
        SetEventChk(0xb4);
        break;
    case 0x0028:
        SetEventChk(0xb5);
        break;
    case 0x00E4:
        SetEventChk(0xb6);
        break;
    case 0x0225:
        SetEventChk(0xb7);
        break;
    case 0x0123:
        SetEventChk(0xb8);
        break;
    case 0x0147:
        SetEventChk(0xb9);
        break;
    default:
        break;
    }
}

static void eventFixes(GameState_Play* play)
{
    /* Skip Zelda's cutscene when having all the spiritual stones */
    if (gSave.quest.stoneEmerald && gSave.quest.stoneRuby && gSave.quest.stoneSapphire)
    {
        SetEventChk(EV_OOT_CHK_ZELDA_FLED);
        SetEventChk(EV_OOT_CHK_ZELDA_FLED_BRIDGE);
    }

    /* Set the rainbow bridge flag */
    if (gSave.quest.medallionLight && gSave.quest.medallionForest && gSave.quest.medallionFire && gSave.quest.medallionWater && gSave.quest.medallionShadow && gSave.quest.medallionSpirit)
    {
        SetEventChk(EV_OOT_CHK_RAINBOW_BRIDGE);
    }

    /* Open Trials */
    if (gSave.entrance == 0x0467)
    {
        SetEventChk(EV_OOT_CHK_TRIAL_LIGHT);
        SetEventChk(EV_OOT_CHK_TRIAL_FIRE);
        SetEventChk(EV_OOT_CHK_TRIAL_SHADOW);
        SetEventChk(EV_OOT_CHK_TRIAL_WATER);
        SetEventChk(EV_OOT_CHK_TRIAL_FOREST);
        SetEventChk(EV_OOT_CHK_TRIAL_SPIRIT);
        SetEventChk(EN_OOT_CHK_GANON_BARRIER);
    }
}

static void endGame(void)
{
    u8  tmpAge;
    u16 tmpNextCutscene;
    s32 tmpCutscene;
    u16 tmpEntrance;
    u16 tmpSceneId;

    /* Flag ganon as beaten */
    gOotExtraFlags.ganon = 1;

    /* Save tmp gameplay values (in case majora was beaten too) */
    tmpAge = gSave.age;
    tmpNextCutscene = *(u16*)((char*)&gSaveContext + 0x1412);
    tmpCutscene = gSave.cutscene;
    tmpEntrance = gSave.entrance;
    tmpSceneId = gSave.sceneId;

    /* Edit gameplay values for end of game save */
    gSave.age = AGE_ADULT;
    *(u16*)((char*)&gSaveContext + 0x1412) = 0;
    gSave.cutscene = 0;
    gSave.entrance = 0x023d;
    gSave.sceneId = SCE_OOT_GANON_CASTLE_EXTERIOR;

    /* Save */
    comboWriteSave();

    /* Restore gameplay values to play the cutscene if majora was beaten too */
    if (gMmExtraFlags2.majora)
    {
        gSave.age = tmpAge;
        *(u16*)((char*)&gSaveContext + 0x1412) = tmpNextCutscene;
        gSave.cutscene = tmpCutscene;
        gSave.entrance = tmpEntrance;
        gSave.sceneId = tmpSceneId;
    }
}

void hookPlay_Init(GameState_Play* play)
{
    if (gSave.entrance == 0x007a)
    {
        /* Entering courtyard */
        if (GetEventChk(EV_OOT_CHK_ZELDA_LETTER))
            gSave.entrance = 0x0594;
        else
            gSave.entrance = 0x0400;
    }
    else if (gSave.entrance == 0x006b)
    {
        endGame();
    }

    if (gMmMag)
    {
        free(gMmMag);
    }
    comboObjectsReset();
    debugCheat(play);
    skipEntranceCutscene(play);
    eventFixes(play);

    Play_Init(play);
    comboSpawnItemGivers(play);

    if (gSave.entrance == 0x0530)
    {
        PlayStoreFlags(play);
        gSave.sceneId = play->sceneId;
        comboGameSwitch();
        return;
    }

    /* Title screen transition skip */
    if (gComboCtx.valid)
    {
        play->transition.gfx = 11;
    }

    if (!gCustomKeep)
    {
        comboLoadCustomKeep();
    }

#if defined(DEBUG)
    if (play->gs.input[0].current.buttons & R_TRIG)
    {
        comboGameSwitch();
        return;
    }
#endif
}

void Play_DrawWrapper(GameState_Play* play)
{
    comboObjectsGC();
    Play_Draw(play);

    if (gComboCtx.valid)
    {
        OPEN_DISPS(play->gs.gfx);
        gDPSetCycleType(OVERLAY_DISP++, G_CYC_FILL);
        gDPSetRenderMode(OVERLAY_DISP++, G_RM_NOOP, G_RM_NOOP2);
        gDPSetFillColor(OVERLAY_DISP++, 0);
        gDPFillRectangle(OVERLAY_DISP++, 0, 0, 0xfff, 0xfff);
        CLOSE_DISPS();
    }
    else
    {
        /* Need to draw dpad */
        comboDpadDraw(play);
    }
}
