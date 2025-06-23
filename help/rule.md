type: modal
### Rule

The rule format `B/S` (where **B** stands for *birth* and **S** for *survival*) defines how cells live and die.

---

#### Examples

**`B3/S23`** means:
- **B3**: A cell is born if it has **exactly 3 neighbors**
- **S23**: A cell survives if it has **exactly 2 or 3 neighbors**

**`B123/S`** means:
- **B123**: A cell is born if it has **exactly 1, 2, or 3 neighbors**
- **S**: A cell never survives

Any other neighbor count causes the cell to **die or remain empty**.

---

Below is an illustration showing how a cell with 3 live neighbors is born:

![Birth Example](help/img/rule_00.png)

You can see the center cell (empty) surrounded by **exactly** 3 live neighbors (black).  
With rule `B3`, it becomes alive in the next generation.

---

### Note

If the number of neighbors exceeds 8, it is capped at 9 internally.  
This means that `B9` or `S9` can be used to represent any case where a cell has **more than 8 neighbors**.
