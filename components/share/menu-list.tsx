import MenuIcon from "@mui/icons-material/Menu";
import {
  // Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useId, useRef, useState } from "react";
import { MenuButton } from "../ui";
import menuItems from "./menuItems.json";

// don't forget to make this into the json version of menulist

export default function MenuListComposition() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const anchorReference = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((previousOpen) => !previousOpen);
  };

  const handleClose = () => {
    // if (anchorRef.current) {
    // 	return;
    // }

    setOpen(false);
  };

  function handleListKeyDown<T extends HTMLElement>(
    event: React.KeyboardEvent<T>,
  ) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const [previousOpen, setPreviousOpen] = useState(open);
  useEffect(() => {
    if (previousOpen && !open) {
      anchorReference.current?.focus();
    }

    setPreviousOpen(open);
  }, [open, previousOpen]);

  return (
    <Stack direction="row" spacing={2}>
      <div>
        <MenuButton
          ref={anchorReference}
          id={useId()}
          aria-controls={open ? "composition-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <MenuIcon />
        </MenuButton>
        <Popper
          open={open}
          anchorEl={anchorReference.current}
          placement="bottom-start"
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom-start" ? "left top" : "left bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem
                      onClick={() => {
                        // window.location.href = "/about";
                        handleClose();
                      }}
                    >
                      This Menu Exists For Fun
                    </MenuItem>
                    {menuItems.map((item) => (
                      <MenuItem
                        key={item.title}
                        onClick={async () => {
                          await router.push(item.url);
                          handleClose();
                        }}
                      >
                        {item.title}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </Stack>
  );
}
