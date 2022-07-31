#include <oot.h>

typedef struct
{
    void*       func;
    uint32_t    values[8];
}
GiHandler;

void zDrawGi_O1T0(void);
void zDrawGi_O1T1(void);
void zDrawGi_O0T1_RecoveryHeart(void);

#define GI_NONE                     {}
#define GI_ENTRY1(func, a)          {&func, {(a) | 0x06000000}}
#define GI_ENTRY2(func, a, b)       {&func, {(a) | 0x06000000, (b) | 0x06000000}}
#define GI_O1T0(a)                  GI_ENTRY1(zDrawGi_O1T0, a)
#define GI_O1T1(a, b)               GI_ENTRY2(zDrawGi_O1T1, a, b)

GiHandler kComboGiHandlers[] = {
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_ENTRY1(zDrawGi_O0T1_RecoveryHeart, 0x00e0), /* Recovery Hearts */
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_O1T1(0x0f20, 0x0b50), /* Green rupee */
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_NONE,
    GI_O1T0(0x0960), /* Kokiri sword */
};

// DEKU MASK GI_O1T1(0x0f20, 0x0b50)
