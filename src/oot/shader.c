#include <combo.h>

void Shader_Opa01(GameState* gs, u16 shaderId)
{
    const Shader* shader;
    shader = &kShaders[shaderId];

    OPEN_DISPS(gs->gfx);
    InitListPolyOpa(gs->gfx);
    gSPMatrix(POLY_OPA_DISP++, GetMatrixMV(gs->gfx), G_MTX_PUSH | G_MTX_LOAD | G_MTX_MODELVIEW);
    gSPDisplayList(POLY_OPA_DISP++, shader->lists[0]);
    gSPDisplayList(POLY_OPA_DISP++, shader->lists[1]);
    CLOSE_DISPS();
}

/* This is glitched (only displays the halo) */
/* TODO: Fix this */
void Shader_MoonTear(GameState* gs, u16 shaderId)
{
    const Shader* shader;
    shader = &kShaders[shaderId];

    OPEN_DISPS(gs->gfx);
    //InitListPolyOpa(gs->gfx);
    InitListPolyXlu(gs->gfx);
    //gSPMatrix(POLY_OPA_DISP++, GetMatrixMV(gs->gfx), G_MTX_PUSH | G_MTX_LOAD | G_MTX_MODELVIEW);
    //gSPDisplayList(POLY_OPA_DISP++, shader->lists[0]);
    gSPMatrix(POLY_XLU_DISP++, GetMatrixMV(gs->gfx), G_MTX_PUSH | G_MTX_LOAD | G_MTX_MODELVIEW);
    gSPDisplayList(POLY_XLU_DISP++, shader->lists[1]);
    CLOSE_DISPS();
}
