type: modal
### Neighbor Mask

In standard Conway's Game of Life, each cell considers its **8 immediate neighbors**.  
However, in this version, you can **customize which of the surrounding 5×5 cells** are considered neighbors.

This gives you full control over how your cells "see" the world.

---

#### How It Works

- The grid around each cell is **5×5**, centered on the current cell.
- You can click squares in the **neighbor mask selector** to enable/disable them.
- **Black squares** are *active* neighbors; **empty ones** are ignored.
- The center cell (itself) can be toggled — you decide whether a cell counts itself as a neighbor

---

#### Example

If only the 8 immediate cells around the center are selected, you get classic behavior.  
If you select all 24 surrounding cells, a cell could react to neighbors much farther away.

---

Below is an example where a cell considers only the horizontal and vertical lines as neighbors:

![Mask Example](help/img/mask_00.png)

As we can see, the central cell considers only the **three cells marked with green** as its neighbors — even though there are many other live cells much closer.
Because of the `B3` rule, it becomes alive in the next generation.

Another example shows a full 5×5 mask:

![Mask Full](help/img/mask_01.png)

In this situation, the central cell considers **all live cells within a 5×5 radius** as its neighbors.  
It has 8 living neighbors, even though there are **no live cells** in the standard 3×3 area around it.  
Since we’re using the `B3/S23` rule — and there’s **no case for 8 neighbors** — the cell will **die in the next generation**.

---

### Tip

The neighbor mask works **together** with your `B/S` rule.  
So `B3` still means "born with 3 neighbors" — but **which** neighbors are counted is up to your mask.
