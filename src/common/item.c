#include <combo.h>

#if defined(GAME_OOT)
# define ITEM_BASE_MM MASK_FOREIGN_ITEM
#else
# define ITEM_BASE_MM 0x0
#endif

const u8 kMaxSticks[] = { 0, 10, 20, 30 };
const u8 kMaxNuts[] = { 0, 20, 30, 40 };
const u8 kMaxBombs[] = { 0, 20, 30, 40 };
const u8 kMaxArrows[] = { 0, 30, 40, 50 };
const u8 kMaxSeeds[] = { 0, 30, 40, 50 };
const u16 kMaxRupees[] = { 99, 200, 500 };

static void comboAddItem(GameState_Play* play, u16 itemId)
{
    if ((itemId & MASK_FOREIGN_ITEM) == ITEM_BASE_MM)
        comboAddItemMm(play, itemId & 0xff);
    else
        comboAddItemOot(play, itemId & 0xff);
}

int comboAddItemGI(GameState_Play* play, s16 gi)
{
    u16 itemId;

    gi--;
    itemId = kExtendedGetItems[gi].itemId;
    if (gi & MASK_FOREIGN_GI)
        itemId |= MASK_FOREIGN_ITEM;

    comboAddItem(play, itemId);
    comboTextHijackItem(play, itemId);
    return -1;
}
