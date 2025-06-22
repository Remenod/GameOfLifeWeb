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

Another example shows a full 5×5 mask:

![Mask Full](help/img/mask_01.png)

You can toggle any of the 24 surrounding positions, and even the center cell itself, to shape how your rule behaves.

---

### Tip

The neighbor mask works **together** with your `B/S` rule.  
So `B3` still means "born with 3 neighbors" — but **which** neighbors are counted is up to your mask.
